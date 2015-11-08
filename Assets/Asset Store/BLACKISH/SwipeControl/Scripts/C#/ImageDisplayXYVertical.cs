///////////////////////////////////////////////
//// 		   ImageDisplay.cs             ////
////  copyright (c) 2010 by Markus Hofer   ////
////          for GameAssets.net           ////
///////////////////////////////////////////////

using UnityEngine;
using System.Collections;

public class ImageDisplayXYVertical : MonoBehaviour {

	public SwipeControlXY swipeCtrl;
	
	//IMAGES
	public Texture2D[] img = new Texture2D[5]; //Array of Images, all images need to have the same dimensions!
	public Rect imgRect; //Leave empty to use img-dimensions and place in the center of the matrix - this can be used to offset the image from the center of the matrix!
	
	//MATRIX
	public bool centerMatrixOnScreen = true; //Check this to move the matrix to the center of the screen (any value in MatrixPosition will be added to this = offset from center)
	public Vector3 matrixPosition = Vector3.zero; //This is the center of the matrix, use this to position the control - everything will rotate around this point!
	private Vector3 prevMatrixPosition;
	public float matrixAngle = 0.0f; //Use this to rotate the GUI //formerly known as globalAngle
	private float previousAngle; //used to check if the Angle changed, so the Quaternion doens't have to be calculated every frame
	private Quaternion quat = Quaternion.identity;
	private Matrix4x4 matrix = Matrix4x4.identity;
	public bool expandInputAreaToFullHeight = false; //Use the full width (left and right of the image) for swiping?
	
	//OPTIONS
	public bool displayAll = false;
	
	//DOTS
	public Texture2D[] dot = new Texture2D[2]; //Dots - First is inactive, second is active. Set Array-length to 0 to hide the dots entirely
	public Vector2 dotRelativeCenterPos; //Position of the dots, relative to the center of imgRect
	
	//DEBUG OPTIONS
	public bool debug = false; //Show Debug Stuff
	public GUIStyle debugBoxStyle;
	
	
	
	void Awake () {
	
		if(!swipeCtrl) swipeCtrl = gameObject.GetComponent<SwipeControlXY>(); //Find SwipeControl on same GameObject if none given
	
		if(imgRect == new Rect(0,0,0,0)) { //If no rect given, create default rect
			imgRect = new Rect(-img[0].width * 0.5f, -img[0].height * 0.5f, img[0].width, img[0].height);
		}
		
		//Set up SwipeControl
		swipeCtrl.pxDistBetweenValues.x = img[0].width;
		swipeCtrl.pxDistBetweenValues.y = img[0].height;
		swipeCtrl.maxValue.x = 0;
		swipeCtrl.maxValue.y = img.GetLength(0) - 1;
		if(expandInputAreaToFullHeight) {
			swipeCtrl.SetActiveArea(new Rect(imgRect.x, -Screen.height * 0.5f, imgRect.width, Screen.height)); // Use image-height for the input-Rect, but full screen-width
		} else {
			swipeCtrl.SetActiveArea(imgRect); //Use the same Rect as the images for input
		}
		swipeCtrl.CalculateEdgeRectsFromActiveArea(imgRect);
		swipeCtrl.Setup();
		
		//Determine center position of the Dots
		if(dotRelativeCenterPos == Vector2.zero) dotRelativeCenterPos.x = imgRect.width * 0.5f + 14f;
		dotRelativeCenterPos = new Vector2((imgRect.x + imgRect.width * 0.5f) + dotRelativeCenterPos.x, (imgRect.y + imgRect.height * 0.5f) + dotRelativeCenterPos.y);
	
		if(centerMatrixOnScreen) { 
			matrixPosition.x += Mathf.Round(Screen.width * 0.5f);
			matrixPosition.y += Mathf.Round(Screen.height * 0.5f);
		}
		
	}
	
	
	void OnGUI () {
		
		// GUI MATRIX
		if(matrixAngle != previousAngle || matrixPosition != prevMatrixPosition) { //only calculate new Quaternion if angle changed
			quat.eulerAngles = new Vector3(0.0f, 0.0f, matrixAngle);
			previousAngle = matrixAngle;
			matrix = Matrix4x4.TRS(matrixPosition, quat, Vector3.one);	//If you're no longer tweaking
			prevMatrixPosition = matrixPosition;
			swipeCtrl.matrix = matrix; // Tell SwipeControl to use the same Matrix we use here
		}
		GUI.matrix = matrix;		
	
	
		// IMAGES
		if(displayAll) { //display all images
			
			for(int i = 0; i < img.Length; i++) {
				GUI.DrawTexture(new Rect(imgRect.x, imgRect.y + imgRect.height * i - swipeCtrl.smoothValue.y * imgRect.height, imgRect.width, imgRect.height), img[i]);
			}
				                
		} else { //only display the selected one and fade the previous and next image in and out
			
			float offset = swipeCtrl.smoothValue.y - Mathf.Round(swipeCtrl.smoothValue.y);
			float mainPos = imgRect.y - (offset * imgRect.height);			
			
			if(Mathf.Round(swipeCtrl.smoothValue.y) >= 0 && Mathf.Round(swipeCtrl.smoothValue.y) < img.GetLength(0)) {
				GUI.color = new Color(1f, 1f, 1f, 1f - Mathf.Abs(offset));
				GUI.DrawTexture(new Rect(imgRect.x, mainPos, imgRect.width, imgRect.height), img[(int) Mathf.Round(swipeCtrl.smoothValue.y)]);
			}
			GUI.color = new Color(1f, 1f, 1f, -offset);
			if(GUI.color.a > 0.0f && Mathf.Round(swipeCtrl.smoothValue.y) - 1 >= 0 && Mathf.Round(swipeCtrl.smoothValue.y) - 1 < img.GetLength(0)) {
				GUI.DrawTexture(new Rect(imgRect.x, mainPos - imgRect.height, imgRect.width, imgRect.height), img[(int) Mathf.Round(swipeCtrl.smoothValue.y) - 1]);
			}
			GUI.color = new Color(1f, 1f, 1f, offset);
			if(GUI.color.a > 0.0f && Mathf.Round(swipeCtrl.smoothValue.y) + 1 < img.GetLength(0) && Mathf.Round(swipeCtrl.smoothValue.y) + 1 >= 0) {
				GUI.DrawTexture(new Rect(imgRect.x, mainPos + imgRect.height, imgRect.width, imgRect.height), img[(int) Mathf.Round(swipeCtrl.smoothValue.y) + 1]);
			}
			GUI.color = new Color(1f, 1f, 1f, 1f);
					
		}
	
	
		// DOTS
		if(dot.Length > 0) {
			for(var i = 0; i < img.GetLength(0); i++) {
				bool activeOrNot = false;
				if(i == Mathf.Round(swipeCtrl.smoothValue.y)) activeOrNot = true; 
				if(!activeOrNot) GUI.DrawTexture(new Rect(Mathf.Round(dotRelativeCenterPos.x - (dot[0].width * 0.5f)), dotRelativeCenterPos.y - (img.GetLength(0) * dot[0].height * 0.5f) + (i * dot[0].height), dot[0].width, dot[0].height), dot[0]);
				else GUI.DrawTexture(new Rect(Mathf.Round(dotRelativeCenterPos.x - (dot[0].width * 0.5f)), Mathf.Round(dotRelativeCenterPos.y - (img.GetLength(0) * dot[0].height * 0.5f) + (i * dot[0].height)), dot[0].width, dot[0].height), dot[1]);
				//GUI.Toggle(new Rect((centerPos.x - (dotStatusArray.Length * 13 * factor * 0.5) + (i * 13 * factor)), (centerPos.y - (13 * factor * 0.5)), 13 * factor, 13 * factor), activeOrNot, GUIContent.none, guiStyle);	
			}	
		}
	
		
		//If you have the BlackishGUI-script you can simply call the following function instead of the above code
		//BlackishGUI.Dots(dotRelativeCenterPos, img.GetLength(0), Mathf.Round(swipeCtrl.smoothValue));
		
	
		//DEBUG info
		if(debug) {
			GUI.Box(new Rect(-2,-2,4,4), GUIContent.none, debugBoxStyle);
			GUI.Box(imgRect, "imgRect with matrix", debugBoxStyle);	
			//GUI.Box(swipeCtrl.leftEdgeRectForClickSwitch, "<<", debugBoxStyle);
			//GUI.Box(swipeCtrl.rightEdgeRectForClickSwitch, ">>", debugBoxStyle);
			GUI.Box(swipeCtrl.activeArea, "activeArea", debugBoxStyle);
	
			GUI.matrix = Matrix4x4.identity;
			GUI.Label(new Rect(Input.mousePosition.x + 15, Screen.height - Input.mousePosition.y - 15, 200, 100), "screen-mouse: " + Input.mousePosition.x + ", " + Input.mousePosition.y + "\nscreen-touch + gui: " + Input.mousePosition.x + ", " + (Screen.height - Input.mousePosition.y));
	
			Vector3 mPos = new Vector3(Input.mousePosition.x - (Screen.width * 0.5f), Input.mousePosition.y - (Screen.height * 0.5f), 0.0f);
			Vector3 tmPos = swipeCtrl.matrix.MultiplyPoint3x4(mPos);
			Vector2 tmPosC = new Vector2(tmPos.x - (Screen.width * 0.5f), tmPos.y - (Screen.height * 0.5f));
			Vector2 ttPosC = new Vector2(tmPos.x - (Screen.width * 0.5f), (Screen.height - tmPos.y) - (Screen.height * 0.5f));
			GUI.Label(new Rect(Input.mousePosition.x + 15, Screen.height - Input.mousePosition.y + 15, 200, 100), "matrix-mouse: " + Mathf.Round(tmPosC.x) + ", " + Mathf.Round(tmPosC.y) + "\nmatrix-touch + gui: " + Mathf.Round(ttPosC.x) + ", " + (Mathf.Round(ttPosC.y)));
		}
	
	
		
	}
}
