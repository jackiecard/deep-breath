///////////////////////////////////////////////
//// 		  CreditsDisplay.js            ////
////  copyright (c) 2010 by Markus Hofer   ////
////          for GameAssets.net           ////
///////////////////////////////////////////////

using UnityEngine;
using System.Collections;

public class CreditsDisplay : MonoBehaviour {

	public SwipeControl swipeCtrl;
	
	//IMAGES
	public Texture2D[] img = new Texture2D[0]; //Array of Images, all images need to have the same dimensions!
	public Rect myRect; //Leave empty to use img-dimensions and place in the center of the matrix - this can be used to offset the image from the center of the matrix!
	
	//MATRIX
	public bool centerMatrixOnScreen = true; //Check this to move the matrix to the center of the screen (any value in MatrixPosition will be added to this = offset from center)
	public Vector3 matrixPosition = Vector3.zero;
	public float matrixAngle = 0.0f; //Use this to rotate the GUI
	private Quaternion quat = Quaternion.identity;
	
	
	void Awake () {
	
		if(!swipeCtrl) swipeCtrl = gameObject.GetComponent<SwipeControl>(); //Find SwipeControl on same GameObject if none given
	
		if(centerMatrixOnScreen) { 
			matrixPosition.x += Mathf.Round(Screen.width * 0.5f);
			matrixPosition.y += Mathf.Round(Screen.height * 0.5f);
		}
	
		if(myRect == new Rect(0,0,0,0)) { //If no rect given, create default rect
			myRect = new Rect(-img[1].width * 0.5f, -img[1].height * 0.5f, img[1].width, img[1].height);
		}
		
		//Set up SwipeControl
		swipeCtrl.partWidth = img[1].width;
		swipeCtrl.maxValue = img.Length - 1;
		swipeCtrl.SetMouseRect(myRect); 
		swipeCtrl.Setup();
	
	}
	
	
	void OnGUI () {
		
		// GUI MATRIX
		quat.eulerAngles = new Vector3(0.0f, 0.0f, matrixAngle);
		GUI.matrix = Matrix4x4.TRS(matrixPosition, quat, Vector3.one);		
	
	
		// Tell SwipeControl to use the same Matrix we use here
		swipeCtrl.matrix = GUI.matrix;
		
		// This creates the scrolling motion from one page to the next:
		swipeCtrl.currentValue = (int) (-1 + Mathf.Round(Mathf.Repeat(Time.realtimeSinceStartup * 0.40f, swipeCtrl.maxValue + 2))); //makes the credits scroll about every 5 seconds.
			//This will make the currentValue go from -1 to maxValue+1
	
		if(swipeCtrl.currentValue >= 0 && swipeCtrl.smoothValue <= swipeCtrl.maxValue + 0.9) { //This prevents hides the images while the control resets from maxValue+1 back to -1
	
			float offset = swipeCtrl.smoothValue - swipeCtrl.currentValue; //Offset from Center
		
			//Draw the images
			float mainPos = myRect.y - (offset * myRect.height);
			if(swipeCtrl.currentValue >= 0 && swipeCtrl.currentValue < img.Length) {
				if(img[swipeCtrl.currentValue] && swipeCtrl.currentValue >= 0 && swipeCtrl.currentValue < img.Length) {
					GUI.color = new Color(1f, 1f, 1f, 1f - Mathf.Abs(offset));
					GUI.DrawTexture(new Rect(myRect.x, mainPos, myRect.width, myRect.height), img[swipeCtrl.currentValue]);
				}
			}
			GUI.color = new Color(1f, 1f, 1f, -offset);
			if(swipeCtrl.currentValue - 1 >= 0 && swipeCtrl.currentValue - 1 < img.Length) {
				if(img[swipeCtrl.currentValue - 1] && GUI.color.a > 0.0 && swipeCtrl.currentValue - 1 >= 0 && swipeCtrl.currentValue - 1 < img.Length) {
					GUI.DrawTexture(new Rect(myRect.x, mainPos - myRect.height, myRect.width, myRect.height), img[swipeCtrl.currentValue - 1]);
				}
			}
			GUI.color = new Color(1f, 1f, 1f, offset);
			if(swipeCtrl.currentValue + 1 >= 0 && swipeCtrl.currentValue + 1 < img.Length) {
				if(img[swipeCtrl.currentValue + 1] && GUI.color.a > 0.0 && swipeCtrl.currentValue + 1 < img.Length && swipeCtrl.currentValue + 1 >= 0) {
					GUI.DrawTexture(new Rect(myRect.x, mainPos + myRect.height, myRect.width, myRect.height), img[swipeCtrl.currentValue + 1]);
				}
			}
			GUI.color = new Color(1f, 1f, 1f, 1f);
	
		}
	
		
	}
}
