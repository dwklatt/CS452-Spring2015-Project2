//Derek Klatt and Sean Obyrne
var canvas;
var gl;
var numCubes = 6;
var currentCubes = 1;

//var numVertices  = 36*numCubes;
var pointsArray = [];
var normalsArray = [];
var texCoordsArray = [];
var colorsArray = [];

var texSize = 256;
var numChecks = 16;

var texture1, texture2;
var t1, t2;

var dir = 0;

var vertexColors = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 0.0, 1.0, 1.0, 1.0 ),  // white
    vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan
];  

var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
];

var image1 = new Uint8Array(4*texSize*texSize);

    for ( var i = 0; i < texSize; i++ ) {
        for ( var j = 0; j <texSize; j++ ) {
            var patchx = Math.floor(i/(texSize/numChecks));
            if(patchx%2) c = 255;
            else c = 0;
            image1[4*i*texSize+4*j] = c;
            image1[4*i*texSize+4*j+1] = c;
            image1[4*i*texSize+4*j+2] = c;
            image1[4*i*texSize+4*j+3] = 255;
        }
    }
    
var image2 = new Uint8Array(4*texSize*texSize);

    // Create a checkerboard pattern
    for ( var i = 0; i < texSize; i++ ) {
        for ( var j = 0; j <texSize; j++ ) {
            var patchy = Math.floor(j/(texSize/numChecks));
            if(patchy%2) c = 255;
            else c = 0;
            image2[4*i*texSize+4*j] = c;
            image2[4*i*texSize+4*j+1] = c;
            image2[4*i*texSize+4*j+2] = c;
            image2[4*i*texSize+4*j+3] = 255;
           }
    }
	


var lightPosition = vec4(-1.0, 0, 1.0, 1.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialShininess = 100.0;

var ctm;
var ambientColor, diffuseColor, specularColor;
var modelView, projection;
var viewerPos;
var program;

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = 0;
var prevAxis = 0;
var theta =[0, 0, 0];

var thetaLoc;

var flag = true;

var p = 2;

function configureTexture() {
    texture1 = gl.createTexture();       
    gl.bindTexture( gl.TEXTURE_2D, texture1 );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, image1);
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, 
                      gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    texture2 = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture2 );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, image2);
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, 
                      gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
}

function quad(a, b, c, d) {

	    var t1 = subtract(positionArray[b], positionArray[a]);
		var t2 = subtract(positionArray[c], positionArray[b]);
		var normal = cross(t1, t2);
		var normal = vec3(normal);
	 
		pointsArray.push(positionArray[a]); 
		normalsArray.push(normal); 
		colorsArray.push(vertexColors[a]); 	 
		texCoordsArray.push(texCoord[0]);

		pointsArray.push(positionArray[b]); 
		colorsArray.push(vertexColors[a]);
		normalsArray.push(normal); 
		texCoordsArray.push(texCoord[1]); 

		pointsArray.push(positionArray[c]); 
		normalsArray.push(normal);  
		colorsArray.push(vertexColors[a]);
		texCoordsArray.push(texCoord[2]); 	
		
		pointsArray.push(positionArray[a]);  
		normalsArray.push(normal); 
		colorsArray.push(vertexColors[a]);	
		texCoordsArray.push(texCoord[0]); 
		
		pointsArray.push(positionArray[c]); 
		normalsArray.push(normal); 
		colorsArray.push(vertexColors[a]);
		texCoordsArray.push(texCoord[2]); 
		
		pointsArray.push(positionArray[d]); 
		normalsArray.push(normal);   
		colorsArray.push(vertexColors[a]);	
		texCoordsArray.push(texCoord[3]);    		
}
var positionArray = [];

var translation = [
        vec4( 0.5,0,0, -0.5),
        vec4( -0.5,0,0, -0.5 ),
        vec4( 0,  0.5,  0, -0.5 ),
        vec4( 0, -0.5,  0, -0.5 ),
        vec4( 0, 0, 0.5, -0.5 ),
        vec4( 0,  0, -0.5, -0.5 ),
        vec4( 0,  0, 0, -0.5 ),
        vec4( 0.1, -0.1, -0.1, 1.0 )
    ];

var vertices = [
        vec4( -0.1, -0.1,  0.1, 1.0 ),
        vec4( -0.1,  0.1,  0.1, 1.0 ),
        vec4( 0.1,  0.1,  0.1, 1.0 ),
        vec4( 0.1, -0.1,  0.1, 1.0 ),
        vec4( -0.1, -0.1, -0.1, 1.0 ),
        vec4( -0.1,  0.1, -0.1, 1.0 ),
        vec4( 0.1,  0.1, -0.1, 1.0 ),
        vec4( 0.1, -0.1, -0.1, 1.0 )
    ];

function colorCube(){
	for(var i = 0; i < numCubes; i++){

		quad( 8*i+1, 8*i+0, 8*i+3, 8*i+2 );
		quad( 8*i+2, 8*i+3, 8*i+7, 8*i+6 );
		quad( 8*i+3, 8*i+0, 8*i+4, 8*i+7 );
		quad( 8*i+6, 8*i+5, 8*i+1, 8*i+2 );
		quad( 8*i+4, 8*i+5, 8*i+6, 8*i+7 );
		quad( 8*i+5, 8*i+4, 8*i+0, 8*i+1 );
		
	}
}

function makeCubes(){
  positionArray = [];
	for(var i = 0; i < numCubes; i++){
		for(var j = 0; j < 8; j++){
			positionArray.push(add(vertices[j], translation[i]));
		}
	}	
}
// function addCube(){
	// for(var j = 0; j < 8; j++){
		// positionArray.push(add(vertices[j], translation[numCubes-1]));
	// }
// }
var nBuffer;
var vNormal;
var vBuffer;
var vPosition;
var tBuffer;
var vTexCoord ;
var cBuffer;
var vColor;

function god(){
	currentCubes ++;
	if(currentCubes > numCubes){
			currentCubes = numCubes;
			//return;
	}
	//render();
}

function devil(){
	currentCubes --;
	if(currentCubes < 0){
			currentCubes = 0;
			//return;
	}
}

window.onload = function init() {
  canvas = document.getElementById( "gl-canvas" );
  gl = WebGLUtils.setupWebGL( canvas );
  if ( !gl ) { alert( "WebGL isn't available" ); }
  gl.viewport( 0, 0, canvas.width, canvas.height );
  gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
  gl.enable(gl.DEPTH_TEST);
  //
  // Load shaders and initialize attribute buffers
  //
  program = initShaders( gl, "vertex-shader", "fragment-shader" );
  gl.useProgram( program );

	makeCubes();
    //addCube();
    colorCube();

    nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );
    
    vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );

    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );
    
    vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
	
		//uncomment these lines for a multi color object!
	
	// cBuffer = gl.createBuffer();
    // gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    // gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW );
    
    // vColor = gl.getAttribLocation( program, "vColor" );
    // gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    // gl.enableVertexAttribArray( vColor );
	
	  tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW );
    
    vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
    gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vTexCoord );
	
    
    viewerPos = vec3(0.0, 0.0, -20.0 );

    //projection = ortho(-p, p, -p, p, -100, 100);
    
    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);

    document.getElementById("ButtonX").onclick = function(){prevAxis = axis; axis = xAxis;};
    document.getElementById("ButtonY").onclick = function(){prevAxis = axis; axis = yAxis;};
    document.getElementById("ButtonZ").onclick = function(){prevAxis = axis; axis = zAxis;};
    document.getElementById("ButtonT").onclick = function(){god();};
		document.getElementById("ButtonU").onclick = function(){devil();};
		document.getElementById("ZoomIn").onclick = function(){if(p > 1) {p = p / 1.25;}}
		document.getElementById("ZoomOut").onclick = function(){p = p * 1.25;}
		document.getElementById("Default").onclick = function(){p = 2;}

	  thetaLoc = gl.getUniformLocation(program, "theta");

	gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
	   flatten(ambientProduct));
	gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
	   flatten(diffuseProduct) );
	gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), 
	   flatten(specularProduct) );	
	gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), 
	   flatten(lightPosition) );
	   
	gl.uniform1f(gl.getUniformLocation(program, 
	   "shininess"),materialShininess);
	
	//gl.uniformMatrix4fv( gl.getUniformLocation(program, "projectionMatrix"), false, flatten(projection));
	   
	configureTexture();
	
	gl.activeTexture( gl.TEXTURE0 );
	gl.bindTexture( gl.TEXTURE_2D, texture1 );
	gl.uniform1i(gl.getUniformLocation( program, "Tex0"), 0);
			
	gl.activeTexture( gl.TEXTURE1 );
	gl.bindTexture( gl.TEXTURE_2D, texture2 );
	gl.uniform1i(gl.getUniformLocation( program, "Tex1"), 1);
	
	render();	

	//god();
}
var rotation = 1;
var render = function(){
            
    projection = ortho(-p, p, -p, p, -100, 100);
	  gl.uniformMatrix4fv( gl.getUniformLocation(program, "projectionMatrix"), false, flatten(projection));

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    if(prevAxis == axis){
		rotation = rotation * -1;
		prevAxis = -1;
	}
	
	theta[axis] += rotation*2.0;
    
	
    modelView = mat4();
    modelView = mult(modelView, rotate(theta[xAxis], [1, 0, 0] ));
    modelView = mult(modelView, rotate(theta[yAxis], [0, 1, 0] ));
    modelView = mult(modelView, rotate(theta[zAxis], [0, 0, 1] ));
    
    gl.uniformMatrix4fv( gl.getUniformLocation(program,
            "modelViewMatrix"), false, flatten(modelView) );

    gl.drawArrays( gl.TRIANGLES, 0, 36*currentCubes );
            
            
    requestAnimFrame(render);
}
