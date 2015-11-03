///////////////////////////////////////////////
////   	      SwipeControlXY.cs            ////
////  copyright (c) 2011 by Markus Hofer   ////
////          for GameAssets.net           ////
///////////////////////////////////////////////
////									   ////
//// This is a version of SwipeControl     ////
//// that works in 2 axis! (horizontally   ////
//// and vertically) 					   ////
////  									   ////
///////////////////////////////////////////////

using UnityEngine;
using System.Collections;

public class SwipeControlXY : MonoBehaviour {


	public bool controlEnabled = true; //turn this control on or off
	public bool skipAutoSetup = false; //If you set it up from another script you can skip the auto-setup! - Don't forget to call Setup() though!!
	public bool allowInput = true; //If you don't want to allow mouse or touch input and only want to use this control for animating a value, set this to false.
	public bool clickEdgeToSwitch = true; //When mouse-controlled, should a simple click on either side of the control increases/decreases the value by one?
	
	public Vector2 pxDistBetweenValues = new Vector2(200f, 50f); // how many pixels do you have to move the mouse/finger in each direction to get to the next value? - this was called partWidth before...
	private Vector2 partFactor = new Vector2(1f, 1f); // calculated once in the beginning, so we don't have to do costly divisions every frame
	public Vector2 startValue = Vector2.zero; // start with this value //used to be int
	public Vector2 currentValue = Vector2.zero; // current value
	public Vector2 maxValue = new Vector2(10f, 10f); //max value
	
	public Rect activeArea; //where you can click to start the swipe movement (once you clicked you can drag outside as well) - used to be called MouseRect
	public Rect leftEdgeRectForClickSwitch;
	public Rect rightEdgeRectForClickSwitch;
	
	public Matrix4x4 matrix = Matrix4x4.identity;
	
	private bool touched = false; //dragging operation in progress?
	private int[] fingerStartArea = new int[20]; //set to 1 for each finger that starts touching the screen within our touchRect
	private Vector2[] fingerStartPos = new Vector2[20]; //set starting Pos for each finger that starts touching the screen within our touchRect
	private int mouseStartArea = 0; //set to 1 if mouse starts clicking within touchRect
	public Vector2 smoothValue = Vector2.zero; //current smooth value between 0 and maxValue
	private Vector2 smoothStartPos = Vector2.zero; 
	private Vector2 smoothDragOffset = new Vector2(0.2f, 0.2f); //how far (% of the width of one element) do we have to drag to set it to change currentValue?
	//private Vector2 lastSmoothValue = Vector2.zero;
	private float[] prevSmoothValueX = new float[5]; //remember previous values - used to capture the momentum of a swipe more acurately
	private float[] prevSmoothValueY = new float[5];
	private float realtimeStamp; //needed to make Mathf.SmoothDamp work even if Time.timeScale == 0
	private float xVelocity; //current velocity of Mathf.SmoothDamp()
	private float yVelocity; //current velocity of Mathf.SmoothDamp()
	public Vector2 maxSpeed = new Vector2(20.0f, 20.0f); //Clamp the maximum speed of Mathf.SmoothDamp()
	
	private Vector2 mStartPos;
	private Vector3 pos; //Touch/Mouse Position turned into a Vector3
	private Vector2 tPos; //transformed Position
	
	public bool selected = false; //true if selected by touch (click/touch instead of swipe)
	
	public bool debug = false;

	

	IEnumerator Start() {
		
		if(clickEdgeToSwitch && !allowInput) {
			Debug.LogWarning("You have enabled clickEdgeToSwitch, but it will not work because allowInput is disabled!", this);
		}
		
		if(pxDistBetweenValues.x == 0f && pxDistBetweenValues.y == 0f) Debug.LogWarning("pxDistBetweenValues is zero - you won't be able to swipe with this setting...", this);
		
		yield return new WaitForSeconds(0.2f);
		
		if(!skipAutoSetup) {
			Setup();
		}
	}


	public void Setup() {
		partFactor.x = 1.0f/pxDistBetweenValues.x;
		partFactor.y = 1.0f/pxDistBetweenValues.y;
		smoothValue.x = Mathf.Round(currentValue.x); //Set smoothValue to the currentValue - tip: setting currentValue to -1 and startValue to 0 makes the first image appear at the start...
		smoothValue.y = Mathf.Round(currentValue.y);
		currentValue = startValue; //Apply Start-value
		
		if(activeArea != new Rect(0,0,0,0)) {
			SetActiveArea(activeArea);	
		}
			
		if(leftEdgeRectForClickSwitch == new Rect(0,0,0,0)) CalculateEdgeRectsFromActiveArea(); //Only do this if not set in the inspector	
	
		if(matrix == Matrix4x4.zero) matrix = Matrix4x4.identity.inverse;
	}
	
	
	public void SetActiveArea(Rect myRect) {
		activeArea = myRect;
	}
	
	
	public void CalculateEdgeRectsFromActiveArea () { CalculateEdgeRectsFromActiveArea(activeArea); }
	public void CalculateEdgeRectsFromActiveArea (Rect myRect) {
			leftEdgeRectForClickSwitch.x = myRect.x;
			leftEdgeRectForClickSwitch.y = myRect.y;
			leftEdgeRectForClickSwitch.width = myRect.width * 0.5f;
			leftEdgeRectForClickSwitch.height = myRect.height;
		
			rightEdgeRectForClickSwitch.x = myRect.x + myRect.width * 0.5f;
			rightEdgeRectForClickSwitch.y = myRect.y;
			rightEdgeRectForClickSwitch.width = myRect.width * 0.5f;
			rightEdgeRectForClickSwitch.height = myRect.height;	
	}
	
	
	public void SetEdgeRects(Rect leftRect, Rect rightRect) {
		leftEdgeRectForClickSwitch = leftRect;
		rightEdgeRectForClickSwitch = rightRect;		
	}
	
	
	float GetAvgValue(float[] arr) {
		
		float sum = 0.0f;
		for(int i = 0; i < arr.Length; i++) {
			sum += arr[i];
		}
			
		if(arr.Length == 5) return sum * 0.2f;
		return sum / arr.Length;
		
	}
	
	
	
	void FillArrayWithValue(float[] arr, float val) {
		
		for(int i = 0; i < arr.Length; i++) {
			arr[i] = val;	
		}
		
	}
	
	
	
	void Update () {
		
		if(controlEnabled) {
			
			touched = false;
			
			if(allowInput) {

				#if UNITY_STANDALONE_OSX || UNITY_STANDALONE_WIN || UNITY_WEBPLAYER || UNITY_DASHBOARD_WIDGET || UNITY_NACL || UNITY_FLASH || UNITY_EDITOR
				if(Input.GetMouseButton(0) || Input.GetMouseButtonUp(0)) {
					pos = new Vector3(Input.mousePosition[0], Screen.height - Input.mousePosition[1], 0.0f);
					tPos = matrix.inverse.MultiplyPoint3x4(pos);
					
					//BEGAN
					if(Input.GetMouseButtonDown(0) && activeArea.Contains(tPos)) {
						mouseStartArea = 1;	
					}
					
					//WHILE MOUSEDOWN
					if(mouseStartArea == 1) {
						touched = true;
						//START
						if(Input.GetMouseButtonDown(0)) {
							mStartPos = tPos;
							smoothStartPos.x = smoothValue.x + tPos.x * partFactor.x;	
							smoothStartPos.y = smoothValue.y + tPos.y * partFactor.y;	
							FillArrayWithValue(prevSmoothValueX, smoothValue.x);
							FillArrayWithValue(prevSmoothValueY, smoothValue.y);
						}
						//DRAGGING
						smoothValue.x = smoothStartPos.x - tPos.x * partFactor.x;
						smoothValue.y = smoothStartPos.y - tPos.y * partFactor.y;
						if(smoothValue.x < -0.12f) { smoothValue.x = -0.12f; }
						else if(smoothValue.x > maxValue.x + 0.12f) { smoothValue.x = maxValue.x + 0.12f; }
						if(smoothValue.y < -0.12f) { smoothValue.y = -0.12f; }
						else if(smoothValue.y > maxValue.y + 0.12f) { smoothValue.y = maxValue.y + 0.12f; }

						//END
						if(Input.GetMouseButtonUp(0)) {
							if((tPos - mStartPos).sqrMagnitude < 25) {
								if(clickEdgeToSwitch) {
									if(leftEdgeRectForClickSwitch.Contains(tPos)) {
										currentValue.x -=  1f;
										if(currentValue.x < 0f) currentValue.x = 0f;
									} else if(rightEdgeRectForClickSwitch.Contains(tPos)) {
										currentValue.x += 1f;
										if(currentValue.x > maxValue.x) currentValue.x = maxValue.x;
									}
								} else {
									selected = !selected;
								}
							} else {
								if(currentValue.x - (smoothValue.x + (smoothValue.x - GetAvgValue(prevSmoothValueX))) > smoothDragOffset.x || currentValue.x - (smoothValue.x + (smoothValue.x - GetAvgValue(prevSmoothValueX))) < -smoothDragOffset.x){ //dragged beyond dragOffset to the right
									currentValue.x = Mathf.Round(smoothValue.x + (smoothValue.x - GetAvgValue(prevSmoothValueX)));
									xVelocity = (smoothValue.x - GetAvgValue(prevSmoothValueX)); // * -0.10 ;
									if(currentValue.x > maxValue.x) currentValue.x = maxValue.x;
									else if(currentValue.x < 0) currentValue.x = 0;					
								}	
								if(currentValue.y - (smoothValue.y + (smoothValue.y - GetAvgValue(prevSmoothValueY))) > smoothDragOffset.y || currentValue.y - (smoothValue.y + (smoothValue.y - GetAvgValue(prevSmoothValueY))) < -smoothDragOffset.y){ //dragged beyond dragOffset to the right
									currentValue.y = Mathf.Round(smoothValue.y + (smoothValue.y - GetAvgValue(prevSmoothValueY)));
									yVelocity = (smoothValue.y - GetAvgValue(prevSmoothValueY)); // * -0.10 ;
									if(currentValue.y > maxValue.y) currentValue.y = maxValue.y;
									else if(currentValue.y < 0) currentValue.y = 0;					
								}									
							}		
							mouseStartArea = 0;
						}
						for(int i = 1; i < prevSmoothValueX.Length; i++) {
								prevSmoothValueX[i] = prevSmoothValueX[i- 1];
								prevSmoothValueY[i] = prevSmoothValueY[i- 1];
						}
						prevSmoothValueX[0] = smoothValue.x;
						prevSmoothValueY[0] = smoothValue.y;
					}
				}
				#endif
	
				#if UNITY_IPHONE || UNITY_ANDROID || UNITY_EDITOR
				foreach (Touch touch in Input.touches){
					pos = new Vector3(touch.position.x, Screen.height - touch.position.y, 0.0f);
					tPos = matrix.inverse.MultiplyPoint3x4(pos);		
			
					//BEGAN
					//print(tPos + " inside " + activeArea + "?");
					if (touch.phase == TouchPhase.Began && activeArea.Contains(tPos)) {
						fingerStartArea[touch.fingerId] = 1;
						fingerStartPos[touch.fingerId] = tPos;
						//print("hit!");
					}
					//WHILE FINGER DOWN
					if(fingerStartArea[touch.fingerId] == 1) { // no touchRect.Contains check because once you touched down you're allowed to drag outside...
						touched = true;
						//START
						if(touch.phase == TouchPhase.Began) {
							smoothStartPos.x = smoothValue.x + tPos.x * partFactor.x;
							FillArrayWithValue(prevSmoothValueX, smoothValue.x);
							smoothStartPos.y = smoothValue.y + tPos.y * partFactor.y;
							FillArrayWithValue(prevSmoothValueY, smoothValue.y);
						}
						//DRAGGING
						if((tPos - fingerStartPos[touch.fingerId]).sqrMagnitude > 15f*15f) { //only count once the finger has moved at least 15px on screen
							smoothValue.x = smoothStartPos.x - tPos.x * partFactor.x; //print("smoothValue : " + smoothValue);
							smoothValue.y = smoothStartPos.y - tPos.y * partFactor.y; //print("smoothValue : " + smoothValue);
							if(smoothValue.x < -0.12f) { smoothValue.x = -0.12f; }
							else if(smoothValue.x > maxValue.x + 0.12f) { smoothValue.x = maxValue.x + 0.12f; }
							if(smoothValue.y < -0.12f) { smoothValue.y = -0.12f; }
							else if(smoothValue.y > maxValue.y + 0.12f) { smoothValue.y = maxValue.y + 0.12f; }
						}
						//END
						if(touch.phase == TouchPhase.Ended) {
							if((tPos - fingerStartPos[touch.fingerId]).sqrMagnitude < 100f) {
								selected = !selected;
							} else {
								if(currentValue.x - (smoothValue.x + (smoothValue.x - GetAvgValue(prevSmoothValueX))) > smoothDragOffset.x || currentValue.x - (smoothValue.x + (smoothValue.x - GetAvgValue(prevSmoothValueX))) < -smoothDragOffset.x){ //dragged beyond dragOffset to the right
									currentValue.x = Mathf.Round(smoothValue.x + (smoothValue.x - GetAvgValue(prevSmoothValueX)));
									xVelocity = (smoothValue.x - GetAvgValue(prevSmoothValueX)); // * -0.10 ;
									if(currentValue.x > maxValue.x) currentValue.x = maxValue.x;
									else if(currentValue.x < 0f) currentValue.x = 0f;					
								}							
								if(currentValue.y - (smoothValue.y + (smoothValue.y - GetAvgValue(prevSmoothValueY))) > smoothDragOffset.y || currentValue.y - (smoothValue.y + (smoothValue.y - GetAvgValue(prevSmoothValueY))) < -smoothDragOffset.y){ //dragged beyond dragOffset to the right
									currentValue.y = Mathf.Round(smoothValue.y + (smoothValue.y - GetAvgValue(prevSmoothValueY)));
									yVelocity = (smoothValue.y - GetAvgValue(prevSmoothValueY)); // * -0.10 ;
									if(currentValue.y > maxValue.y) currentValue.y = maxValue.y;
									else if(currentValue.y < 0f) currentValue.y = 0f;					
								}							
							}
						}		
						for(int i = 1; i < prevSmoothValueX.Length; i++) {
							prevSmoothValueX[i] = prevSmoothValueX[i- 1];
							prevSmoothValueY[i] = prevSmoothValueY[i- 1];
						}
						prevSmoothValueX[0] = smoothValue.x;
						prevSmoothValueY[0] = smoothValue.y;
					}
			
			
					if(touch.phase == TouchPhase.Ended || touch.phase == TouchPhase.Canceled) fingerStartArea[touch.fingerId] = 0;
			
				}
				#endif
	
			}
		
			if(!touched) {
				smoothValue.x = Mathf.SmoothDamp(smoothValue.x, currentValue.x, ref xVelocity, 0.3f, maxSpeed.x, Time.realtimeSinceStartup - realtimeStamp);
				smoothValue.y = Mathf.SmoothDamp(smoothValue.y, currentValue.y, ref yVelocity, 0.3f, maxSpeed.y, Time.realtimeSinceStartup - realtimeStamp);
			} 
			realtimeStamp = Time.realtimeSinceStartup;	
		}
		
	}
	
	void OnGUI () {
		if(debug) {
			if(Input.touchCount > 0) {
				GUI.Label(new Rect(Input.GetTouch(0).position.x + 15, Screen.height - Input.GetTouch(0).position.y - 60, 200, 100), "pos : " + pos + "\ntPos: " + tPos);
			}
	
	//		GUI.Label(new Rect(Input.mousePosition.x + 15, Screen.height - Input.mousePosition.y - 60, 200, 100), "mPos : " + mPos + "\ntmPos: " + tmPos + "\ntPos: " + tPos);
			GUI.matrix = matrix;
			GUI.Box(activeArea, GUIContent.none);
		}
	}

}
