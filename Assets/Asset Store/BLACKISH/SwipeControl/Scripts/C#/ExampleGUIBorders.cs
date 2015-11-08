using UnityEngine;
using System.Collections;

public class ExampleGUIBorders : MonoBehaviour {

	//BORDERS
	public bool displayBorders = true; //Display 
	public GUIStyle borderStyle; //Use this style for the borders
	
	public float borderOffsetTop = 100.0f;
	public float borderOffsetBottom = 100.0f;
	
	public SwipeControl swipeCtrl;
	
	
	void Awake() {
		if(!swipeCtrl) swipeCtrl = gameObject.GetComponent<SwipeControl>(); //Find SwipeControl on same GameObject if none given
	}
	
	
	void OnGUI () {
		
		if(displayBorders) {
			GUI.matrix = swipeCtrl.matrix;
				
			// BARS
			GUI.Box(new Rect(-Screen.width, -Screen.height, Screen.width * 2.0f, Screen.height - borderOffsetTop), GUIContent.none, borderStyle);
			GUI.Box(new Rect(-Screen.width, borderOffsetBottom, Screen.width * 2.0f, Screen.height), GUIContent.none, borderStyle);	
		}
		
	}
	
}
