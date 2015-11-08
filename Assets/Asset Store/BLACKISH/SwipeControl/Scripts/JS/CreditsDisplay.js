///////////////////////////////////////////////
//// 		  CreditsDisplay.js            ////
////  copyright (c) 2010 by Markus Hofer   ////
////          for GameAssets.net           ////
///////////////////////////////////////////////

var swipeCtrl : SwipeControl;

//IMAGES
var img = new Texture2D[0]; //Array of Images, all images need to have the same dimensions
var myRect : Rect; //Define your own Rect here. Leave empty to use img-dimensions and place in the center of the screen

//MATRIX
var centerMatrixOnScreen : boolean = true; //Check this to move the matrix to the center of the screen (any value in MatrixPosition will be added to this = offset from center)
var matrixPosition : Vector3 = Vector3.zero;
var matrixAngle : float = 0.0; //Use this to rotate the GUI
private var quat : Quaternion = Quaternion.identity;


function Awake () {

	if(!swipeCtrl) swipeCtrl = gameObject.GetComponent("SwipeControl"); //Find SwipeControl on same GameObject if none given

	if(centerMatrixOnScreen) { 
		matrixPosition.x += Mathf.Round(Screen.width * 0.5);
		matrixPosition.y += Mathf.Round(Screen.height * 0.5);
	}

	if(myRect == new Rect(0,0,0,0)) { //If no rect given, create default rect
		myRect = new Rect(-img[1].width * 0.5, -img[1].height * 0.5, img[1].width, img[1].height);
	}
	
	//Set up SwipeControl
	swipeCtrl.partWidth = img[1].width;
	swipeCtrl.maxValue = img.Length - 1;
	swipeCtrl.SetMouseRect(myRect); 
	swipeCtrl.Setup();

}


function OnGUI () {
	
	// GUI MATRIX
	quat.eulerAngles = Vector3(0.0, 0.0, matrixAngle);
	GUI.matrix = Matrix4x4.TRS(matrixPosition, quat, Vector3.one);		


	// Tell SwipeControl to use the same Matrix we use here
	swipeCtrl.matrix = GUI.matrix;
	
	// This creates the scrolling motion from one page to the next:
	swipeCtrl.currentValue = -1 + Mathf.Round(Mathf.Repeat(Time.realtimeSinceStartup * 0.40, swipeCtrl.maxValue + 2)); //makes the credits scroll about every 5 seconds.
		//This will make the currentValue go from -1 to maxValue+1

	if(swipeCtrl.currentValue >= 0 && swipeCtrl.smoothValue <= swipeCtrl.maxValue + 0.9) { //This prevents hides the images while the control resets from maxValue+1 back to -1

		var offset : float = swipeCtrl.smoothValue - swipeCtrl.currentValue; //Offset from Center
	
		//Draw the images
		var mainPos : float = myRect.y - (offset * myRect.height);
		if(swipeCtrl.currentValue >= 0 && swipeCtrl.currentValue < img.Length) {
			if(img[swipeCtrl.currentValue] && swipeCtrl.currentValue >= 0 && swipeCtrl.currentValue < img.length) {
				GUI.color.a = 1 - Mathf.Abs(offset);
				GUI.DrawTexture(new Rect(myRect.x, mainPos, myRect.width, myRect.height), img[swipeCtrl.currentValue]);
			}
		}
		GUI.color.a = -offset;
		if(swipeCtrl.currentValue - 1 >= 0 && swipeCtrl.currentValue - 1 < img.Length) {
			if(img[swipeCtrl.currentValue - 1] && GUI.color.a > 0.0 && swipeCtrl.currentValue - 1 >= 0 && swipeCtrl.currentValue - 1 < img.length) {
				GUI.DrawTexture(new Rect(myRect.x, mainPos - myRect.height, myRect.width, myRect.height), img[swipeCtrl.currentValue - 1]);
			}
		}
		GUI.color.a = offset;
		if(swipeCtrl.currentValue + 1 >= 0 && swipeCtrl.currentValue + 1 < img.Length) {
			if(img[swipeCtrl.currentValue + 1] && GUI.color.a > 0.0 && swipeCtrl.currentValue + 1 < img.length && swipeCtrl.currentValue + 1 >= 0) {
				GUI.DrawTexture(new Rect(myRect.x, mainPos + myRect.height, myRect.width, myRect.height), img[swipeCtrl.currentValue + 1]);
			}
		}
		GUI.color.a = 1.0;

	}

	
}