//Derek Klatt and Sean Obyrne
var gl;

var lightPosition = vec4(1.0, 1.0, 1.0, 0.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialShininess = 20.0;

var ctm;
var ambientColor, diffuseColor, specularColor;


var nRows = 50;
var nColumns = 50;

var pointsArray = [
// Front face
	-0.25, -0.25,  0.25,
	0.25, -0.25,  0.25,
	0.25,  0.25,  0.25,
	-0.25,  0.25,  0.25,

	// Back face
	-0.25, -0.25, -0.25,
	-0.25,  0.25, -0.25,
	0.25,  0.25, -0.25,
	0.25, -0.25, -0.25,

	// Top face
	-0.25,  0.25, -0.25,
	-0.25,  0.25,  0.25,
	0.25,  0.25,  0.25,
	0.25,  0.25, -0.25,

	// Bottom face
	-0.25, -0.25, -0.25,
	0.25, -0.25, -0.25,
	0.25, -0.25,  0.25,
	-0.25, -0.25,  0.25,

	// Right face
	0.25, -0.25, -0.25,
	0.25,  0.25, -0.25,
	0.25,  0.25,  0.25,
	0.25, -0.25,  0.25,

	// Left face
	-0.25, -0.25, -0.25,
	-0.25, -0.25,  0.25,
	-0.25,  0.25,  0.25,
	-0.25,  0.25, -0.25
];

var cubeIndices = [
	0, 1, 2,      0, 2, 3,    // Front face
	4, 5, 6,      4, 6, 7,    // Back face
	8, 9, 10,     8, 10, 11,  // Top face
	12, 13, 14,   12, 14, 15, // Bottom face
	16, 17, 18,   16, 18, 19, // Right face
	20, 21, 22,   20, 22, 23  // Left face
];

var fColor;

var near = -10;
var far = 10;
var radius = 6.0;
var theta  = 0.0;
var phi    = 0.25;
var dr = 5.0 * Math.PI/180.0;

const black = vec4(0.0, 0.0, 0.0, 1.0);
const red = vec4(1.0, 0.0, 0.0, 1.0);

const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

var left = -2.0;
var right = 2.0;
var ytop = 2.0;
var bottom = -2.0;

var modeViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

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
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    // enable depth testing and polygon offset
    // so lines will be in front of filled triangles
    
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.POLYGON_OFFSET_FILL);
    gl.polygonOffset(1.0, 2.0);

// vertex array of nRows*nColumns quadrilaterals 
// (two triangles/quad) from data
    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);

    var vBufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    
    // Color data
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    var faceColors = [
        [1.0, 0.0, 0.0, 1.0], // Front face
        [0.0, 1.0, 0.0, 1.0], // Back face
        [0.0, 0.0, 1.0, 1.0], // Top face
        [1.0, 1.0, 0.0, 1.0], // Bottom face
        [1.0, 0.0, 1.0, 1.0], // Right face
        [0.0, 1.0, 1.0, 1.0]  // Left face
    ];
    var vertexColors = [];
    for (var i in faceColors) {
        var color = faceColors[i];
        for (var j=0; j < 4; j++) {
            vertexColors = vertexColors.concat(color);
        }
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);
    
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );
    
    var cubeIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeIndices), gl.STATIC_DRAW);
    
    fColor = gl.getUniformLocation(program, "fColor");
 
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    
    gl.uniform4fv( gl.getUniformLocation(program, 
       "ambientProduct"),flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, 
       "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, 
       "specularProduct"),flatten(specularProduct) );	
    gl.uniform4fv( gl.getUniformLocation(program, 
       "lightPosition"),flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program, 
       "shininess"),materialShininess );

    render_interval = setInterval(render, 10);
}

function render()
{
			//left
		if(on[0] == 1){
		}
		//up
		if(on[1] == 1){
			//put jump here?
		}
		//right
		if(on[2] == 1){
		}
		//down
		if(on[3] == 1){
		}
		//space
		if(on[4] == 1){
			//put jump here
		}
		
		updateObjects();
		if (hasLost()) { newGame(); }
		
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    var eye = vec3( radius*Math.sin(theta)*Math.cos(phi), 
                    radius*Math.cos(theta)*Math.sin(phi),
                    radius*Math.cos(theta));
    
    modelViewMatrix = lookAt( eye, at, up );
    projectionMatrix = ortho( left, right, bottom, ytop, near, far );
    
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );

		gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
    requestAnimFrame(render);
}

//Starts a new game
function newGame() {
	time = 0;
	var timer = document.getElementById("timer");
	timer.innerHTML = "<p>Time: " + time + "</p>";
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
	render_interval = setInterval(render, 10);
}
//Collision detection
function hasLost() {
	return false;
}
function updateTime() {
	time++;
	var timer = document.getElementById("timer");
	timer.innerHTML = "<p>Time: " + time + "</p>";
	if(time%4 == 3){
		difficulty++;
	}
	if(time > score){
		score = time;
		var highscore = document.getElementById("score");
		highscore.innerHTML = "<p>High Score: " + score + "</p>"; 
	}
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

function updateObjects(){

}