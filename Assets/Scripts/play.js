#pragma strict

//var movTexture : MovieTexture;

function Update () {
	//movTexture.loop = true;
	//GetComponent.<Renderer>().material.mainTexture = movTexture;
	CoroutinePlayMovie ();	
	new WaitForSeconds(12.0f);
	if(Input.GetMouseButtonDown(0) || Input.touchCount >= 1) {
		Application.LoadLevel("menu_main");
	}
	//movTexture.Play();
}
function CoroutinePlayMovie () {
	Handheld.PlayFullScreenMovie (
		"fluidAndroid.mp4", 
		Color.black, 
		FullScreenMovieControlMode.CancelOnInput,
		FullScreenMovieScalingMode.Fill
		);
}