var swipeCtrl : SwipeControl[];
private var mouseRect : Rect[];

function Start () {
	
	mouseRect = new Rect[swipeCtrl.Length];
	
	for(var i : int = 0; i < swipeCtrl.Length; i++) {
		var screenPos : Vector3 = Camera.main.WorldToScreenPoint(swipeCtrl[i].transform.position);
		mouseRect[i] = new Rect(screenPos.x, Screen.height - screenPos.y, 0, 0);
	}
	
	for(i = 0; i < swipeCtrl.Length; i++) {
		if(swipeCtrl.Length > i+1) {
			mouseRect[i].height = mouseRect[i+1].y - mouseRect[i].y;
		} else if(i-1 >= 0) {
			mouseRect[i].height = mouseRect[i-1].height;
		} else {
			mouseRect[i].height = Screen.height;
		}	
		mouseRect[i].width = Screen.width;
	}
	
	yield new WaitForSeconds(0.5);
	
	for(i = 0; i < swipeCtrl.Length; i++) {
		mouseRect[i].x -= mouseRect[i].width * 0.5;
		if(mouseRect[i].x < 0) mouseRect[i].x = 1;
		if(mouseRect[i].width > Screen.width) mouseRect[i].width = Screen.width -2;
		mouseRect[i].y -= mouseRect[i].height * 0.5;
		swipeCtrl[i].partWidth = Screen.width * 0.3;
		swipeCtrl[i].maxValue = 10;
//		if(i>0) {
//			swipeCtrl[i].startValue = swipeCtrl[i - 1].startValue + Random.Range(-3, 3);	
//		} else 	swipeCtrl[i].startValue = Random.Range(2, 5);
		swipeCtrl[i].SetMouseRect(mouseRect[i]);
		swipeCtrl[i].CalculateEdgeRectsFromMouseRect();
		swipeCtrl[i].Setup();
	}
	
}


function Update () {
	
	for(var i : int = 0; i < swipeCtrl.Length; i++) {
		swipeCtrl[i].transform.eulerAngles.y = swipeCtrl[i].smoothValue * 90.0;
	}
	
}