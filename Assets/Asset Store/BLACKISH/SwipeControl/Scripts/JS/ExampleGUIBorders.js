//BORDERS
var displayBorders : boolean = true; //Display 
var borderStyle : GUIStyle; //Use this style for the borders

var borderOffsetTop : float = 100.0;
var borderOffsetBottom : float = 100.0;

var swipeControl : SwipeControl;


function Awake() {
	if(!swipeControl) swipeControl = GetComponent("SwipeControl");	
}


function OnGUI () {
	
	if(displayBorders) {
		GUI.matrix = swipeControl.matrix;
			
		// BARS
		GUI.Box(new Rect(-Screen.width * 1.0, -Screen.height * 1.0, Screen.width * 2.0, Screen.height*1.0 - borderOffsetTop), GUIContent.none, borderStyle);
		GUI.Box(new Rect(-Screen.width * 1.0, borderOffsetBottom, Screen.width * 2.0, Screen.height*1.0), GUIContent.none, borderStyle);	
	}
	
}