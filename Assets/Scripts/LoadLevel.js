#pragma strict

var levelName : String;

function Start () {
	yield WaitForSeconds(5);
}

function Update ()
	{
	if(Application.GetStreamProgressForLevel(levelName) == 1){
		Application.LoadLevel(levelName);
	}
}