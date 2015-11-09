#pragma strict

var movTexture : MovieTexture;

function Start () {
	movTexture.loop = true;
	GetComponent.<Renderer>().material.mainTexture = movTexture;
	movTexture.Play();
}