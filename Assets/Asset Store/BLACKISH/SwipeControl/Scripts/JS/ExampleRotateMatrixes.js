var imgDs = new ImageDisplay[3];


function Update () {
	
	for(var iD : ImageDisplay in imgDs) {
		iD.matrixAngle += Time.deltaTime * 10f;
	}
	
}