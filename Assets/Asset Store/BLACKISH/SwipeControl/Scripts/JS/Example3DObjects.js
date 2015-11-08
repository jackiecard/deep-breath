var swipeCtrl : SwipeControl;
var obj : Transform[] = new Transform[0];

var minXPos : float = 0; //min x position of the camera
var maxXPos : float = 115; //max x position of the camera
private var xDist : float; //distance between camMinXPos and camMaxXPos
private var xDistFactor : float; // = 1/camXDist

private var swipeSmoothFactor : float = 1.0; // 1/swipeCtrl.maxValue

private var rememberYPos : float;



function Start () {

	xDist = maxXPos - minXPos; //calculate distance between min and max
	xDistFactor = 1.0 / xDist;

	if(!swipeCtrl) swipeCtrl = gameObject.AddComponent(SwipeControl);

	swipeCtrl.skipAutoSetup = true; //skip auto-setup, we'll call Setup() manually once we're done changing stuff
	swipeCtrl.clickEdgeToSwitch = false; //only swiping will be possible
	swipeCtrl.SetMouseRect(new Rect(0, 0, Screen.width, Screen.height)); //entire screen
	swipeCtrl.maxValue = obj.length - 1; //max value
	swipeCtrl.currentValue = swipeCtrl.maxValue; //current value set to max, so it starts from the end
	swipeCtrl.startValue = Mathf.RoundToInt(swipeCtrl.maxValue * 0.5); //when Setup() is called it will animate from the end to the middle
	swipeCtrl.partWidth = Screen.width  / swipeCtrl.maxValue; //how many pixels do you have to swipe to change the value by one? in this case we make it dependent on the screen-width and the maxValue, so swiping from one edge of the screen to the other will scroll through all values.
	swipeCtrl.Setup();

	swipeSmoothFactor = 1.0/swipeCtrl.maxValue; //divisions are expensive, so we'll only do this once in start
	
	rememberYPos = obj[0].position.y;


}


function Update () {
	
	for(var i : int = 0; i < obj.length; i++) {
		obj[i].position.x = minXPos + i * (xDist * swipeSmoothFactor) - swipeCtrl.smoothValue * swipeSmoothFactor * xDist;

		obj[i].position.y = 1.0 * (1 - Mathf.Clamp(Mathf.Abs(i - swipeCtrl.smoothValue), 0.0, 1.0)); //move selected one up a little
	}	
}