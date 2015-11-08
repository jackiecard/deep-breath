var swipeCtrl : SwipeControl;

function Awake () {
	
	if(!swipeCtrl) swipeCtrl = GetComponent("SwipeControl");
		
}


function OnGUI () {

	GUI.matrix = swipeCtrl.matrix;

	// PREVIOUS / NEXT BUTTONS
	if(swipeCtrl.currentValue == 0) GUI.enabled = false;	
	if(GUI.Button(new Rect(-150, 95, 80, 30), "Previous")) swipeCtrl.currentValue--;
	GUI.enabled = true;
	if(swipeCtrl.currentValue == swipeCtrl.maxValue) GUI.enabled = false;
	if(GUI.Button(new Rect(70, 95, 80, 30), "Next")) swipeCtrl.currentValue++;	
	GUI.enabled = true;	
	
}