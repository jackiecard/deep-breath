 #pragma strict
 
 var color : Color;
 
 function Start(){
     
     color = Color.white;
     
 }
 
 function Update(){
 
    // Fade();
 }
  
 function Fade(){
 
     while (GetComponent.<GUIText>().material.color.a > 0){
         GetComponent.<GUIText>().material.color.a -= 0.1 * Time.deltaTime * 0.05;
     yield;
     }
 }