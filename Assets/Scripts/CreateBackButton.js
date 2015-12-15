#pragma strict

function Start () {
	WaitForSeconds(7.0f);
	
}

function Update () {
	if(Input.GetMouseButtonDown(0) && WaitForSeconds(7.0f)){
	Application.LoadLevel("menu_main");
	}
}