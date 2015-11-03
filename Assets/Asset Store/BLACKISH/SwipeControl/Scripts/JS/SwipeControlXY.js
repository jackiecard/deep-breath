///////////////////////////////////////////////
////   	      SwipeControlXY.js            ////
////  copyright (c) 2011 by Markus Hofer   ////
////          for GameAssets.net           ////
///////////////////////////////////////////////
////									   ////
//// This is a version of SwipeControl     ////
//// that works in 2 axis! (horizontally   ////
//// and vertically) 					   ////
////  									   ////
///////////////////////////////////////////////

var controlEnabled : boolean = true; //turn this control on or off
var skipAutoSetup : boolean = false; //If you set it up from another script you can skip the auto-setup! - Don't forget to call Setup() though!!
var allowInput : boolean = true; //If you don't want to allow mouse or touch input and only want to use this control for animating a value, set this to false.
var clickEdgeToSwitch : boolean = true; //When mouse-controlled, should a simple click on either side of the control increases/decreases the value by one?

var pxDistBetweenValues : Vector2 = new Vector2(200f, 50f); // // how many pixels do you have to move the mouse/finger in each direction to get to the next value? - this was called partWidth before...
private var partFactor : Vector2 = new Vector2(1f, 1f); // calculated once in the beginning, so we don't have to do costly divisions every frame
var startValue : Vector2 = Vector2.zero; // start with this value
var currentValue : Vector2 = Vector2.zero; // current value
var maxValue : Vector2 = new Vector2(10,10); //max value

var activeArea : Rect; //where you can click to start the swipe movement (once you clicked you can drag outside as well) - used to be called MouseRect
var leftEdgeRectForClickSwitch = new Rect();
var rightEdgeRectForClickSwitch = new Rect();

var matrix : Matrix4x4 = Matrix4x4.identity;

private var touched : boolean = false; //dragging operation in progress?
private var fingerStartPos = new Vector2[20]; //set starting Pos for each finger that starts touching the screen within our touchRect
private var fingerStartArea = new int[5]; //set to 1 for each finger that starts touching the screen within our touchRect
private var mouseStartArea : int = 0; //set to 1 if mouse starts clicking within touchRect
var smoothValue : Vector2 = Vector2.zero; //current smooth value between 0 and maxValue
private var smoothStartPos : Vector2 = Vector2.zero; //
private var smoothDragOffset : Vector2 = new Vector2(0.2f, 0.2f); //how far (% of the width of one element) do we have to drag to set it to change currentValue?
private var lastSmoothValue : float;
private var prevSmoothValueX = new float[5];
private var prevSmoothValueY = new float[5];
private var realtimeStamp : float; //needed to make Mathf.SmoothDamp work even if Time.timeScale == 0
private var xVelocity : float; //current velocity of Mathf.SmoothDamp()
private var yVelocity : float; 
var maxSpeed = new Vector2(20.0, 20.0); //Clamp the maximum speed of Mathf.SmoothDamp()
public var bufferZone : float = 0.12f;

private var mStartPos : Vector2;
private var pos : Vector3; //Touch/Mouse Position turned into a Vector3
private var tPos : Vector2; //transformed Position

var selected : boolean = false; //true if selected by touch (click/touch instead of swipe)


var debug : boolean = false;


function Start() {
	
	if(clickEdgeToSwitch && !allowInput) {
		Debug.LogWarning("You have enabled clickEdgeToSwitch, but it will not work because allowInput is disabled!", this);
	}

	if(pxDistBetweenValues.x == 0f && pxDistBetweenValues.y == 0f) Debug.LogWarning("pxDistBetweenValues is zero - you won't be able to swipe with this setting...", this);	
			
	yield new WaitForSeconds(0.2);
	
	if(!skipAutoSetup) {
		Setup();
	}
}


function Setup() {
	partFactor.x = 1.0/pxDistBetweenValues.x;
	partFactor.y = 1.0/pxDistBetweenValues.y;
	smoothValue.x = Mathf.Round(currentValue.x); //Set smoothValue to the currentValue - tip: setting currentValue to -1 and startValue to 0 makes the first image appear at the start...
	smoothValue.y = Mathf.Round(currentValue.y);
	currentValue = startValue; //Apply Start-value
	
	if(activeArea != new Rect(0,0,0,0)) {
		SetActiveArea(activeArea);	
	}
					
	if(leftEdgeRectForClickSwitch == new Rect(0,0,0,0)) CalculateEdgeRectsFromActiveArea(); //Only do this if not set in the inspector	

	if(matrix == Matrix4x4.zero) matrix = Matrix4x4.identity.inverse;
}


function SetActiveArea(myRect : Rect) {
	activeArea = myRect;
}


function CalculateEdgeRectsFromActiveArea () { CalculateEdgeRectsFromActiveArea(activeArea); }
function CalculateEdgeRectsFromActiveArea (myRect : Rect) {
		leftEdgeRectForClickSwitch.x = myRect.x;
		leftEdgeRectForClickSwitch.y = myRect.y;
		leftEdgeRectForClickSwitch.width = myRect.width * 0.5;
		leftEdgeRectForClickSwitch.height = myRect.height;
	
		rightEdgeRectForClickSwitch.x = myRect.x + myRect.width * 0.5;
		rightEdgeRectForClickSwitch.y = myRect.y;
		rightEdgeRectForClickSwitch.width = myRect.width * 0.5;
		rightEdgeRectForClickSwitch.height = myRect.height;	
}


function SetEdgeRects(leftRect : Rect, rightRect : Rect) {
	leftEdgeRectForClickSwitch = leftRect;
	rightEdgeRectForClickSwitch = rightRect;		
}


function GetAvgValue(arr : float[]) {
	
	var sum : float = 0.0;
	for(var i : int = 0; i < arr.Length; i++) {
		sum += arr[i];
	}
		
	return sum / arr.Length;
	
}



function FillArrayWithValue(arr : float[], val : float) {
	
	for(var i : int = 0; i < arr.Length; i++) {
		arr[i] = val;	
	}
	
}



function Update () {
	
	if(controlEnabled) {
		
		touched = false;
		
		if(allowInput) {
			
			#if UNITY_STANDALONE_OSX || UNITY_STANDALONE_WIN || UNITY_WEBPLAYER || UNITY_DASHBOARD_WIDGET || UNITY_NACL || UNITY_FLASH || UNITY_EDITOR
			if(Input.GetMouseButton(0) || Input.GetMouseButtonUp(0)) {
				pos = Vector3(Input.mousePosition.x, Screen.height - Input.mousePosition.y, 0.0);
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
					if(smoothValue.x < -bufferZone) { smoothValue.x = -bufferZone; }
					else if(smoothValue.x > maxValue.x + bufferZone) { smoothValue.x = maxValue.x + bufferZone; }
					if(smoothValue.y < -bufferZone) { smoothValue.y = -bufferZone; }
					else if(smoothValue.y > maxValue.y + bufferZone) { smoothValue.y = maxValue.y + bufferZone; }
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
						for(var i : int = 1; i < prevSmoothValueX.Length; i++) {
								prevSmoothValueX[i] = prevSmoothValueX[i- 1];
								prevSmoothValueY[i] = prevSmoothValueY[i- 1];
						}
						prevSmoothValueX[0] = smoothValue.x;
						prevSmoothValueY[0] = smoothValue.y;
				}
			}
			#endif
			
			#if UNITY_IPHONE || UNITY_ANDROID || UNITY_EDITOR
			for(touch in Input.touches){
				pos = Vector3(touch.position.x, Screen.height - touch.position.y, 0.0);
				tPos = matrix.inverse.MultiplyPoint3x4(pos);		
		
				//BEGAN
				//print(tPos + " inside " + activeArea + "?");
				if (touch.phase == TouchPhase.Began && activeArea.Contains(tPos)) {
					fingerStartPos[touch.fingerId] = tPos;
					fingerStartArea[touch.fingerId] = 1;
					print("hit!");
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
						smoothValue.x = smoothStartPos.x - tPos.x * partFactor.x;
						smoothValue.y = smoothStartPos.y - tPos.y * partFactor.y;
						if(smoothValue.x < -bufferZone) { smoothValue.x = -bufferZone; } //prevent it from going too far off screen
						else if(smoothValue.x > maxValue.x + bufferZone) { smoothValue.x = maxValue.x + bufferZone; }
						if(smoothValue.y < -bufferZone) { smoothValue.y = -bufferZone; }
						else if(smoothValue.y > maxValue.y + bufferZone) { smoothValue.y = maxValue.y + bufferZone; }
					}
					//END
					if(touch.phase == TouchPhase.Ended) {
							if((tPos - fingerStartPos[touch.fingerId]).sqrMagnitude < 15f*15f) { //count as selection if finger endpos and startpos are less than 15px apart
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
						for(var j = 1; j < prevSmoothValueX.Length; j++) {
							prevSmoothValueX[j] = prevSmoothValueX[j- 1];
							prevSmoothValueY[j] = prevSmoothValueY[j- 1];
						}
						prevSmoothValueX[0] = smoothValue.x;
						prevSmoothValueY[0] = smoothValue.y;
				}
		
		
				if(touch.phase == TouchPhase.Ended || touch.phase == TouchPhase.Canceled) fingerStartArea[touch.fingerId] = 0;
		
			}
			#endif

		}
	
		if(!touched) {
				smoothValue.x = Mathf.SmoothDamp(smoothValue.x, currentValue.x, xVelocity, 0.3f, maxSpeed.x, Time.realtimeSinceStartup - realtimeStamp);
				smoothValue.y = Mathf.SmoothDamp(smoothValue.y, currentValue.y, yVelocity, 0.3f, maxSpeed.y, Time.realtimeSinceStartup - realtimeStamp);
		} 
		realtimeStamp = Time.realtimeSinceStartup;	
	}
	
}

function OnGUI () {
	if(debug) {
		if(Input.touchCount > 0) {
			GUI.Label(new Rect(Input.GetTouch(0).position.x + 15, Screen.height - Input.GetTouch(0).position.y - 60, 200, 100), "pos : " + pos + "\ntPos: " + tPos);
		}

//		GUI.Label(new Rect(Input.mousePosition.x + 15, Screen.height - Input.mousePosition.y - 60, 200, 100), "mPos : " + mPos + "\ntmPos: " + tmPos + "\ntPos: " + tPos);
		GUI.matrix = matrix;
		GUI.Box(activeArea, GUIContent.none);
	}
}
