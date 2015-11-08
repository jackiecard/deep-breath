
var swipeCtrl : SwipeControlFor3D;

function Update () {
	
	transform.eulerAngles.y = swipeCtrl.smoothValue * 90.0;
	
	
}