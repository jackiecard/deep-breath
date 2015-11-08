///////////////////////////////////////////////
//// 		ImageDisplayNoFade.js          ////
////  copyright (c) 2010 by Markus Hofer   ////
////          for GameAssets.net           ////
///////////////////////////////////////////////

var swipeCtrl : SwipeControl;

//IMAGES
var img = new Texture2D[0]; //Array of Images, all images need to have the same dimensions!
var imgRect : Rect; //Leave empty to use img-dimensions and place in the center of the matrix - this can be used to offset the image from the center of the matrix!

var numberOfImagesVisibleLeft : int = 1; //how many additional images should be shown left and right of the selected one?
var numberOfImagesVisibleRight : int = 3; //how many additional images should be shown left and right of the selected one?
var distanceBetweenImages : int = 0;

//MATRIX
var centerMatrixOnScreen : boolean = true; //Check this to move the matrix to the center of the screen (any value in MatrixPosition will be added to this = offset from center)
var matrixPosition : Vector3 = Vector3.zero; //This is the center of the matrix, use this to position the control - everything will rotate around this point!
private var prevMatrixPosition : Vector3;
var matrixAngle : float = 0.0; //Use this to rotate the GUI //formerly known as globalAngle
private var previousAngle : float; //used to check if the Angle changed, so the Quaternion doens't have to be calculated every frame
private var quat : Quaternion = Quaternion.identity;
private var matrix : Matrix4x4 = Matrix4x4.identity;
var expandInputAreaToFullWidth : boolean = false; //Use the full width (left and right of the image) for swiping?

//DOTS
var dot = new Texture2D[2]; //Dots - First is inactive, second is active. Set Array-length to 0 to hide the dots entirely
var dotRelativeCenterPos : Vector2; //Position of the dots, relative to the center of imgRect

//DEBUG OPTIONS
var debug : boolean = false; //Show Debug Stuff
var debugBoxStyle : GUIStyle;



function Awake () {

	if(!swipeCtrl) swipeCtrl = gameObject.GetComponent("SwipeControl"); //Find SwipeControl on same GameObject if none given

	if(imgRect == new Rect(0,0,0,0)) { //If no rect given, create default rect
		imgRect = new Rect(-img[0].width * 0.5, -img[0].height * 0.5, img[0].width, img[0].height);
	}
	
	//Set up SwipeControl
	swipeCtrl.partWidth = img[0].width + distanceBetweenImages;
	swipeCtrl.maxValue = img.Length - 1;
	if(expandInputAreaToFullWidth) {
		//swipeCtrl.SetMouseRect(new Rect(-Screen.width * 0.5, imgRect.y, Screen.width * 1.0, imgRect.height)); // Use image-height for the input-Rect, but full screen-width
		swipeCtrl.SetMouseRect(new Rect(-Screen.width, imgRect.y, Screen.width * 2, imgRect.height)); // Use image-height for the input-Rect, but screen-width
	} else {
		 swipeCtrl.SetMouseRect(imgRect); //Use the same Rect as the images for input
	}
	swipeCtrl.CalculateEdgeRectsFromMouseRect(imgRect);
	swipeCtrl.Setup();
	
	//Determine center position of the Dots
	if(dotRelativeCenterPos == Vector2.zero) dotRelativeCenterPos.y = imgRect.height * 0.5 + 14;
	dotRelativeCenterPos = new Vector2((imgRect.x + imgRect.width * 0.5) + dotRelativeCenterPos.x, (imgRect.y + imgRect.height * 0.5) + dotRelativeCenterPos.y);

	if(centerMatrixOnScreen) { 
		matrixPosition.x += Mathf.Round(Screen.width * 0.5);
		matrixPosition.y += Mathf.Round(Screen.height * 0.5);
	}
	
}


function OnGUI () {
	
	// GUI MATRIX
	if(matrixAngle != previousAngle || matrixPosition != prevMatrixPosition) { //only calculate new Quaternion if angle changed
		quat.eulerAngles = Vector3(0.0, 0.0, matrixAngle);
		previousAngle = matrixAngle;
		matrix = Matrix4x4.TRS(matrixPosition, quat, Vector3.one);	//If you're no longer tweaking
		prevMatrixPosition = matrixPosition;
		swipeCtrl.matrix = matrix; // Tell SwipeControl to use the same Matrix we use here
	}
	GUI.matrix = matrix;		


	// IMAGES
	var offset : float = swipeCtrl.smoothValue - Mathf.Round(swipeCtrl.smoothValue);
	var mainPos : float = imgRect.x - (offset * (imgRect.width + distanceBetweenImages));

	for(var n : int = -numberOfImagesVisibleLeft; n <= numberOfImagesVisibleRight; n++) {
		if(Mathf.Round(swipeCtrl.smoothValue) + n >= 0 && Mathf.Round(swipeCtrl.smoothValue) + n < img.length) {
			GUI.DrawTexture(new Rect(mainPos + imgRect.width * n + distanceBetweenImages * n, imgRect.y, imgRect.width, imgRect.height), img[Mathf.Round(swipeCtrl.smoothValue) + n]);
		}
	}



	// DOTS
	if(dot.Length > 0) {
		for(var i = 0; i < img.Length; i++) {
			var activeOrNot : boolean = false;
			if(i == Mathf.Round(swipeCtrl.smoothValue)) activeOrNot = true; 
			if(!activeOrNot) GUI.DrawTexture(new Rect(dotRelativeCenterPos.x - (img.Length * dot[0].width * 0.5) + (i * dot[0].width), Mathf.Round(dotRelativeCenterPos.y - (dot[0].height * 0.5)), dot[0].width, dot[0].height), dot[0]);
			else GUI.DrawTexture(new Rect(Mathf.Round(dotRelativeCenterPos.x - (img.Length * dot[0].width * 0.5) + (i * dot[0].width)), Mathf.Round(dotRelativeCenterPos.y - (dot[0].height * 0.5)), dot[0].width, dot[0].height), dot[1]);
			//GUI.Toggle(new Rect((centerPos.x - (dotStatusArray.Length * 13 * factor * 0.5) + (i * 13 * factor)), (centerPos.y - (13 * factor * 0.5)), 13 * factor, 13 * factor), activeOrNot, GUIContent.none, guiStyle);	
		}	
	}

	
	//If you have the BlackishGUI-script you can simply call the following function instead of the above code
	//BlackishGUI.Dots(dotRelativeCenterPos, img.Length, Mathf.Round(swipeCtrl.smoothValue));
	

	//DEBUG info
	if(debug) {
		GUI.Box(new Rect(-2,-2,4,4), GUIContent.none, debugBoxStyle);
		GUI.Box(imgRect, "imgRect with matrix", debugBoxStyle);	
		GUI.Box(swipeCtrl.leftEdgeRectForClickSwitch, "<<", debugBoxStyle);
		GUI.Box(swipeCtrl.rightEdgeRectForClickSwitch, ">>", debugBoxStyle);
		GUI.Box(swipeCtrl.mouseRect, "mouseRect", debugBoxStyle);

		GUI.matrix = Matrix4x4.identity;
		GUI.Label(new Rect(Input.mousePosition.x + 15, Screen.height - Input.mousePosition.y - 15, 200, 100), "screen-mouse: " + Input.mousePosition.x + ", " + Input.mousePosition.y + "\nscreen-touch + gui: " + Input.mousePosition.x + ", " + (Screen.height - Input.mousePosition.y));

		var mPos : Vector3 = Vector3(Input.mousePosition.x - (Screen.width * 0.5), Input.mousePosition.y - (Screen.height * 0.5), 0.0);
		var tmPos : Vector3 = swipeCtrl.matrix.MultiplyPoint3x4(mPos);
		var tmPosC : Vector2 = Vector2(tmPos.x - (Screen.width * 0.5), tmPos.y - (Screen.height * 0.5));
		var ttPosC : Vector2 = Vector2(tmPos.x - (Screen.width * 0.5), (Screen.height - tmPos.y) - (Screen.height * 0.5));
		GUI.Label(new Rect(Input.mousePosition.x + 15, Screen.height - Input.mousePosition.y + 15, 200, 100), "matrix-mouse: " + Mathf.Round(tmPosC.x) + ", " + Mathf.Round(tmPosC.y) + "\nmatrix-touch + gui: " + Mathf.Round(ttPosC.x) + ", " + (Mathf.Round(ttPosC.y)));
	}


	
}