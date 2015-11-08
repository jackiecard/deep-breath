///////////////////////////////////////////////
//// 		 SwipeControlFor3D.js          ////
////  copyright (c) 2010 by Markus Hofer   ////
////          for GameAssets.net           ////
///////////////////////////////////////////////

var controlEnabled : boolean = true; //turn this control on or off
var skipAutoSetup : boolean = false; //If you set it up from another script you can skip the auto-setup! - Don't forget to call Setup() though!!
var allowInput : boolean = true; //If you don't want to allow mouse or touch input and only want to use this control for animating a value, set this to false.

var partWidth : float = 150; // how far do you have to move the mouse to change smoothValue by 1? (in px)
private var partFactor : float = 1.0; // calculated once in the beginning, so we don't have to do costly divisions every frame
var startValue : int = 5000; // start with this value
var currentValue : int = 5000; // current value
var maxValue : int = 10000; //max value

var targetObject : Transform;

var matrix : Matrix4x4 = Matrix4x4.identity;

private var touched : boolean = false; //dragging operation in progress?
 var fingerStartArea = new int[5]; //set to 1 for each finger that starts touching the screen within our touchRect
private var mouseStartArea : int = 0; //set to 1 if mouse starts clicking within touchRect
var smoothValue : float = 0.0; //current smooth value between 0 and maxValue
private var smoothStartPos : float; //
private var smoothDragOffset : float = 0.2; //how far (% of the width of one element) do we have to drag to set it to change currentValue?
private var lastSmoothValue : float;
private var prevSmoothValue = new float[5];
private var realtimeStamp : float; //needed to make Mathf.SmoothDamp work even if Time.timeScale == 0
private var xVelocity : float; //current velocity of Mathf.SmoothDamp()
var maxSpeed : float = 20.0; //Clamp the maximum speed of Mathf.SmoothDamp()

private var mStartPos : Vector2;
private var pos : Vector3; //Touch/Mouse Position turned into a Vector3
private var tPos : Vector2; //transformed Position


var debug : boolean = false;


function Start() {
	
	yield new WaitForSeconds(0.2);
	
	if(!skipAutoSetup) {
		Setup();
	}
}


function Setup() {
	partFactor = 1.0/partWidth;
	smoothValue = parseFloat(currentValue); //Set smoothValue to the currentValue - tip: setting currentValue to -1 and startValue to 0 makes the first image appear at the start...
	currentValue = startValue; //Apply Start-value
		
	if(matrix == Matrix4x4.zero) matrix = Matrix4x4.identity.inverse;
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
			
			if(Input.GetMouseButton(0) || Input.GetMouseButtonUp(0)) {
				pos = Vector3(Input.mousePosition.x, Screen.height - Input.mousePosition.y, 0.0);
				tPos = matrix.inverse.MultiplyPoint3x4(pos);
				
				//BEGAN
				if(Input.GetMouseButtonDown(0)) {
					var ray = Camera.main.ScreenPointToRay (Input.mousePosition);
					var hit : RaycastHit;
					if (Physics.Raycast (ray, hit, 200)) {
						if(hit.transform == targetObject) {
							mouseStartArea = 1;					
						}        
				    }
				}
				
				//WHILE MOUSEDOWN
				if(mouseStartArea == 1) {
					touched = true;
					//START
					if(Input.GetMouseButtonDown(0)) {
						mStartPos = tPos;
						smoothStartPos = smoothValue + tPos.x * partFactor;	
						FillArrayWithValue(prevSmoothValue, smoothValue);
					}
					//DRAGGING
					smoothValue = smoothStartPos - tPos.x * partFactor;
					if(smoothValue < -0.12) { smoothValue = -0.12; }
					else if(smoothValue > maxValue + 0.12) { smoothValue = maxValue + 0.12; }
					//END
					if(Input.GetMouseButtonUp(0)) {
						if((tPos - mStartPos).sqrMagnitude < 25) {

						} else {
							if(currentValue - (smoothValue + (smoothValue - GetAvgValue(prevSmoothValue))) > smoothDragOffset || currentValue - (smoothValue + (smoothValue - GetAvgValue(prevSmoothValue))) < -smoothDragOffset){ //dragged beyond dragOffset to the right
								currentValue = Mathf.Round(smoothValue + (smoothValue - GetAvgValue(prevSmoothValue)));
								xVelocity = (smoothValue - GetAvgValue(prevSmoothValue)); // * -0.10 ;
								if(currentValue > maxValue) currentValue = maxValue;
								else if(currentValue < 0) currentValue = 0;					
							}	
						}		
						mouseStartArea = 0;
					}
					for(var i : int = 1; i < prevSmoothValue.Length; i++) {
							prevSmoothValue[i] = prevSmoothValue[i- 1];
					}
					prevSmoothValue[0] = smoothValue;
				}
			}

			#if UNITY_IPHONE or UNITY_ANDROID
			for(touch in Input.touches){
				pos = Vector3(touch.position.x, Screen.height - touch.position.y, 0.0);
				tPos = matrix.inverse.MultiplyPoint3x4(pos);		
		
				//BEGAN
				//print(tPos + " inside " + mouseRect + "?");
				if (touch.phase == TouchPhase.Began) {
					var tray = Camera.main.ScreenPointToRay (new Vector2(pos.x, pos.y));
					var thit : RaycastHit;
					if (Physics.Raycast (tray, thit, 200)) {
						if(thit.transform == targetObject) {
							fingerStartArea[touch.fingerId] = 1;
						}
				    }					
				}
				//WHILE FINGER DOWN
				if(fingerStartArea[touch.fingerId] == 1) { // no touchRect.Contains check because once you touched down you're allowed to drag outside...
					touched = true;
					//START
					if(touch.phase == TouchPhase.Began) {
						smoothStartPos = smoothValue + tPos.x * partFactor;
						FillArrayWithValue(prevSmoothValue, smoothValue);
					}
					//DRAGGING
					smoothValue = smoothStartPos - tPos.x * partFactor; //print("smoothValue : " + smoothValue);
					if(smoothValue < -0.12) { smoothValue = -0.12; }
					else if(smoothValue > maxValue + 0.12) { smoothValue = maxValue + 0.12; }
					//END
					if(touch.phase == TouchPhase.Ended) {
						if(currentValue - (smoothValue + (smoothValue - GetAvgValue(prevSmoothValue))) > smoothDragOffset || currentValue - (smoothValue + (smoothValue - GetAvgValue(prevSmoothValue))) < -smoothDragOffset){ //dragged beyond dragOffset to the right
							currentValue = Mathf.Round(smoothValue + (smoothValue - GetAvgValue(prevSmoothValue)));
							xVelocity = (smoothValue - GetAvgValue(prevSmoothValue)); // * -0.10 ;
							if(currentValue > maxValue) currentValue = maxValue;
							else if(currentValue < 0) currentValue = 0;					
						}							
					}		
					for(i = 1; i < prevSmoothValue.Length; i++) {
							prevSmoothValue[i] = prevSmoothValue[i- 1];
					}
					prevSmoothValue[0] = smoothValue;
				}
		
		
				if(touch.phase == TouchPhase.Ended || touch.phase == TouchPhase.Canceled) fingerStartArea[touch.fingerId] = 0;
		
			}
			#endif

		}
	
		if(!touched) {
			smoothValue = Mathf.SmoothDamp(smoothValue, parseFloat(currentValue), xVelocity, 0.3, maxSpeed, Time.realtimeSinceStartup - realtimeStamp);
		} 
		realtimeStamp = Time.realtimeSinceStartup;	
	}
	
}

function OnGUI () {
	if(debug) {
		if(Input.touchCount > 0) {
			GUI.Label(new Rect(Input.GetTouch(0).position.x + 15, Screen.height - Input.GetTouch(0).position.y - 60, 200, 100), "pos : " + pos + "\ntPos: " + tPos);
		}
	}
}
