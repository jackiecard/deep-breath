#pragma strict

//var movTexture : MovieTexture;

function Start () {
//	if(Input.GetMouseButtonDown(0) || Input.touchCount >= 1) {
//		Application.LoadLevel("menu_main");
//	}
//}

//function Update () {
	//movTexture.loop = true;
	//GetComponent.<Renderer>().material.mainTexture = movTexture;
	//movTexture.Play();

	CoroutinePlayMovie ();	
	if ((Input.touchCount == 1 || Input.GetMouseButtonDown(0)) &&
          (Input.GetTouch(0).phase == TouchPhase.Began) )
     {
     	Application.LoadLevel("menu_main");
     }
}

function CoroutinePlayMovie () {
	Handheld.PlayFullScreenMovie (
		"energizing.mp4", 
		Color.white, 
		//FullScreenMovieControlMode.CancelOnInput,
		FullScreenMovieControlMode.CancelOnInput,
		FullScreenMovieScalingMode.Fill
		);
}