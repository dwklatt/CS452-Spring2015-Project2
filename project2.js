//Derek Klatt and Sean Obyrne
var gl;
var points;
var transX = 0.0;
var transY = 0.0;
var canvas;
var blockSpeed = new Float32Array([
// thrid bit in each row does nothing other than make array comparison easier blockSpeed[index * 2 / 3 + 1]
0,0,0,
0,0,0,
0,0,0,
0,0,0,
0,0,0,
0,0,0,
0,0,0,
0,0,0,
0,0,0,
0,0,0,
0,0,0,
0,0,0,
0,0,0,
0,0,0,
0,0,0,
0,0,0,
0,0,0,
0,0,0,
0,0,0,
0,0,0,
0,0,0
]);

var verticesSizes = new Float32Array([
//why did you add so many?
//you didnt even add speed and color blocks to acomadtate for the growth
//i did testing and was never going to grow object before 3 minutes at 4s intervals you had it at 11
0,-1,10,
-2,-2,10,
-2,-2,10,
-2,-2,10,
-2,-2,10,
-2,-2,10,
-2,-2,10,
-2,-2,10,
-2,-2,10,
-2,-2,10,
-2,-2,10,
-2,-2,10,
-2,-2,10,
-2,-2,10,
-2,-2,10,
-2,-2,10,
-2,-2,10,
-2,-2,10,
-2,-2,10,
-2,-2,10,
-2,-2,10
]);
var program;
var bufferId;
var vPosition;
var cBuffer;
var vColor;
var n = 0;
var vertexColors = [
vec4( 0.0, 0.0, 0.0, 1.0 ), // black
vec4( 1.0, 0.0, 0.0, 1.0 ), // red
vec4( 1.0, 1.0, 0.0, 1.0 ), // yellow
vec4( 0.0, 0.0, 1.0, 1.0 ), // blue
vec4( 1.0, 0.0, 0.0, 1.0 ), // red
vec4( 1.0, 1.0, 0.0, 1.0 ), // yellow
vec4( 0.0, 0.0, 1.0, 1.0 ), // blue
vec4( 1.0, 0.0, 0.0, 1.0 ), // red
vec4( 1.0, 1.0, 0.0, 1.0 ), // yellow
vec4( 0.0, 0.0, 1.0, 1.0 ), // blue
vec4( 1.0, 0.0, 0.0, 1.0 ) // red
];
var on = [0,0,0,0,0];
var time = 0;
var score = 0;
var timer_interval;
var render_interval;
var difficulty = 1;
window.onload = function init()
{
	// window size to make the game screen fit
	var window_w = window.innerWidth;
	var window_h = window.innerHeight;
	// timer init
	var timer = document.getElementById("timer");
	timer.style.left = window_w/2 + 50 + "px";
	timer_interval = setInterval("updateTime()", 1000);
	// moving score under the time
	var score_board = document.getElementById("score");
	score_board.style.left = window_w/2 + 50 + "px"
	canvas = document.getElementById( "gl-canvas" );
	// canvas.width = window_w/2;
	//canvas.height = window_h - 40;
	gl = WebGLUtils.setupWebGL( canvas );
	if ( !gl ) { alert( "WebGL isn't available" ); }
	document.onkeydown = keypressed;
	document.onkeyup = kup;
	//
	// Configure WebGL
	//
	gl.viewport( 0, 0, canvas.width, canvas.height );
	gl.clearColor( 0.0, 1.0, 0.0, 1.0 );
	// Load shaders and initialize attribute buffers
	program = initShaders( gl, "vertex-shader", "fragment-shader" );
	gl.useProgram( program );
	cBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
	gl.bufferData( gl.ARRAY_BUFFER, flatten(vertexColors), gl.STATIC_DRAW );
	vColor = gl.getAttribLocation( program, "vColor" );
	gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vColor );
	//render every 50 ms
	render_interval = setInterval(toRender, 10);
};
//Starts a new game
function newGame() {
	time = 0;
	var timer = document.getElementById("timer");
	timer.innerHTML = "<p>Time: " + time + "</p>";
	verticesSizes[0] = 0;
	verticesSizes[1] = 0;
	verticesSizes[2] = 10;
	for(var i = 3; i < verticesSizes.length; i+=3){
		verticesSizes[i] = -2;
		verticesSizes[i+1] = -2;
		verticesSizes[i+2] = 10;
	}
	transX = 0.0;
	transY = 0.0;
	on[0] = 0;
	on[1] = 0;
	on[2] = 0;
	on[3] = 0;
	on[4] = 0;
	difficulty = 1;
	var button = document.getElementById("newGame");
	button.style.visibility = "visible";
}
function restart() {
	var button = document.getElementById("newGame");
	button.style.visibility = "hidden";
	timer_interval = setInterval("updateTime()", 1000);
	render_interval = setInterval(toRender, 10);
}
//Collision detection
function hasLost() {
	for(var i = 3; i < verticesSizes.length; i+=3){
		var xdiff = verticesSizes[0] - verticesSizes[i];
		var ydiff = verticesSizes[1] - verticesSizes[i+1];
		if ((-0.0355 <= xdiff && xdiff <= 0) || (0 <= xdiff && xdiff <= 0.0355)) {
			if ((-0.0355 <= ydiff && ydiff <= 0) || (0 <= ydiff && ydiff <= 0.0355)) {
				clearInterval(render_interval);
				clearInterval(timer_interval);
				return true;
			}
		}
	}
	return false;
}
function updateTime() {
	time++;
	var timer = document.getElementById("timer");
	timer.innerHTML = "<p>Time: " + time + "</p>";
	// verticesSizes[2] += 0.1; // way to easy
	if(time%4 == 3){
		if(difficulty * 3 < verticesSizes.length){ difficulty++; }
		else { verticesSizes[2] += 0.3; }
		//console.log(difficulty*3, verticesSizes.length)
	}
	if(time > score){
		score = time;
		var highscore = document.getElementById("score");
		highscore.innerHTML = "<p>High Score: " + score + "</p>"; 
	}
}
function toRender(){
	//left
	if(on[0] == 1){
		verticesSizes[0] -= 0.01;
	}
	//up
	if(on[1] == 1){
		//verticesSizes[1] += 0.01;
		//put jump here?
	}
	//right
	if(on[2] == 1){
		verticesSizes[0] += 0.01;
	}
	//down
	if(on[3] == 1){
		//verticesSizes[1] -= 0.01;
	}
	//space
	if(on[4] == 1){
		//put jump here
	}
	//detect player hitting wall
	if(verticesSizes[0] > 1.0-verticesSizes[2]/500)
		verticesSizes[0] = 1.0-verticesSizes[2]/500;
	if(verticesSizes[0] < -1.0+verticesSizes[2]/500)
		verticesSizes[0] = -1.0+verticesSizes[2]/500;
	if(verticesSizes[1] > 1.0-verticesSizes[2]/500)
		verticesSizes[1] = 1.0-verticesSizes[2]/500;
	if(verticesSizes[1] < -1.0+verticesSizes[2]/500)
		verticesSizes[1] = -1.0+verticesSizes[2]/500;
	//other wall collision
	updateObjects();
	if (hasLost()) { newGame(); }
	//developer hax
	//verticesSizes[0] = transX;
	//verticesSizes[1] = transY;
	n = 11;
	// Create a buffer object
	var vertexSizeBuffer = gl.createBuffer();
	if (!vertexSizeBuffer) {
		console.log('Failed to create the buffer object');
	}
	// Bind the buffer object to target
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexSizeBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, verticesSizes, gl.STATIC_DRAW);
	var FSIZE = verticesSizes.BYTES_PER_ELEMENT;
	//Get the storage location of a_Position, assign and enable buffer
	var vPosition = gl.getAttribLocation(program, 'vPosition');
	if (vPosition < 0) {
		console.log('Failed to get the storage location of vPosition');
	}
	gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, FSIZE * 3, 0);
	gl.enableVertexAttribArray(vPosition); // Enable the assignment of the buffer object
	// Get the storage location of a_PointSize
	var a_PointSize = gl.getAttribLocation(program, 'a_PointSize');
	if(a_PointSize < 0) {
		console.log('Failed to get the storage location of a_PointSize');
	}
	gl.vertexAttribPointer(a_PointSize, 1, gl.FLOAT, false, FSIZE * 3, FSIZE * 2);
	gl.enableVertexAttribArray(a_PointSize); // Enable buffer allocation
	// Unbind the buffer object
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	render();
}
function keypressed(event) {
	//left
	if(event.keyCode == '37')
		on[0] = 1;
	//up
	else if(event.keyCode == '38')
		on[1] = 1;
	//right
	else if(event.keyCode == '39')
		on[2] = 1;
	//down
	else if(event.keyCode == '40')
		on[3] = 1;
	//space
	else if(event.keyCode == '32')
		on[4] = 1;
}
function kup(event) {
	if(event.keyCode == '37')
		on[0] = 0;
	else if(event.keyCode == '38')
		on[1] = 0;
	else if(event.keyCode == '39')
		on[2] = 0;
	else if(event.keyCode == '40')
		on[3] = 0;
	else if(event.keyCode == '32')
		on[4] = 0;
}
function render() {
	gl.clear(gl.COLOR_BUFFER_BIT);
	// Draw three points
	gl.drawArrays(gl.POINTS, 0, n);
}
function updateObjects(){
	for(i = 3; i < difficulty * 3 + 1; i +=3){
	// if collision with a wall
		if(verticesSizes[i] > 1.0-verticesSizes[i+2]/500 || verticesSizes[i] < -1.0+verticesSizes[i+2]/500 || verticesSizes[i+1] > 1.0-verticesSizes[i+2]/500 || verticesSizes[i+1] < -1.0+verticesSizes[i+2]/500)
			makeNewObjects(i);
	//move object
		verticesSizes[i] += blockSpeed[i];
		verticesSizes[i+1] += blockSpeed[i+1];
	}
}
function makeNewObjects(index){
	// 0-1 + (0 or -1)
	var wall = 0; //= Math.floor(Math.random() * 4); // 0-3
	var randomPlace = Math.random() * 2 - 1;
	//var direction = 0.01 * Math.pow(-1, Math.round(Math.random() * 2)) * Math.round(randomPlace);
	if(wall == 0){
		verticesSizes[index] = randomPlace;
		verticesSizes[index + 1] = 1.0-verticesSizes[i+2]/500; // top wall
		blockSpeed[index] = 0;
		blockSpeed[index + 1] = -0.01; // move down
	}
}
