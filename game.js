var canvas;
var gl;

var buttonDiv;
var codeDiv;

var gameCamera;

var staticMeshes = [];

window.onload = function(){
    buttonDiv = document.getElementById('buttonDivID');
    codeDiv = document.getElementById('codeDivID');
    canvas = document.getElementById('canvasID');

    window.addEventListener('resize', windowResize);
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);

    buttonDiv.style.position = 'absolute';
    buttonDiv.style.border = 'solid';
    codeDiv.style.position = 'absolute';
    codeDiv.style.border = 'solid';
    canvas.style.position = 'absolute';
    canvas.style.border = 'solid';

    windowResize();

    gl = canvas.getContext('webgl2');
    gl.clearColor(0, 1, 1, 1);  
    gl.enable(gl.DEPTH_TEST); 
    gl.enable(gl.CULL_FACE); 

    gameCamera = new Camera();
    gameCamera.setPerspectiveProjection(70.0, canvas.width / canvas.height, 0.001, 1000.0);
    gameCamera.position.z = 5;
    gameCamera.updateView();

    // let verts = [
    //     -0.5, -0.5, 0.0, 0.0, 0.0, -1.0, 0.0, 1.0,
    //     -0.5,  0.5, 0.0, 0.0, 0.0, -1.0, 0.0, 0.0,
    //      0.5,  0.5, 0.0, 0.0, 0.0, -1.0, 1.0, 0.0,
    //      0.5, -0.5, 0.0, 0.0, 0.0, -1.0, 1.0, 1.0,
    // ];

    // let inds = [
    //     0, 1, 2, 2, 3, 0
    // ];

    let verts = [1.0, 1.0, 1.0, 0.5773, 0.5773, 0.5774, 0.3333, 0.6667, -1.0, 1.0, 1.0, -0.5773, 0.5773, 0.5774, 0.3333, 0.6667, -1.0, -1.0, 1.0, -0.5773, -0.5773, 0.5774, 0.6667, 0.3333, 1.0, -1.0, 1.0, 0.5773, -0.5773, 0.5774, 0.0, 1.0, 1.0, -1.0, -1.0, 0.5773, -0.5773, -0.5774, 0.0, 0.6667, -1.0, -1.0, -1.0, -0.5773, -0.5773, -0.5774, 0.6667, 0.6667, -1.0, 1.0, -1.0, -0.5773, 0.5773, -0.5774, 0.3333, 0.3333, 1.0, 1.0, -1.0, 0.5773, 0.5773, -0.5774, 0.3333, 1.0];
    let inds = [0, 1, 2, 2, 3, 0, 4, 3, 2, 2, 5, 4, 5, 2, 1, 1, 6, 5, 6, 7, 4, 4, 5, 6, 7, 0, 3, 3, 4, 7, 6, 1, 0, 0, 7, 6];

    let pix = [
        100, 100, 200, 255, 200, 200, 100, 255, 100, 100, 200, 255,
        200, 200, 100, 255, 100, 100, 200, 255, 200, 200, 100, 255,
        100, 100, 200, 255, 200, 200, 100, 255, 100, 100, 200, 255,
        200, 200, 100, 255, 100, 100, 200, 255, 200, 200, 100, 255,
    ];

    
    initTexturedMeshRenderer();

    let msh = createTexturedMesh(verts, inds);
    msh.textureID = generateGLTexture2D(pix, 3, 4);
    staticMeshes.push(msh);

    msh = createTexturedMesh(verts, inds);
    msh.position.z = -3;
    staticMeshes.push(msh);
    setInterval(updateScreen, 0);
}

function updateScreen(){
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.clear(gl.DEPTH_BUFFER_BIT);

    gameCamera.updateView(0.01);
    
    renderTexturedMeshes(staticMeshes, gameCamera);
}

function windowResize(){
    buttonDiv.style.top = window.innerHeight - (window.innerHeight * 0.25)
    buttonDiv.style.width = window.innerWidth * 0.98;
    buttonDiv.style.height = window.innerHeight * 0.96 * 0.25;
    codeDiv.style.width = window.innerWidth * 0.96 * 0.25;
    codeDiv.style.height = window.innerHeight * 0.96 * 0.75;
    canvas.style.left = window.innerWidth * 0.25;
    canvas.width = window.innerWidth * 0.96 * 0.75;
    canvas.height = window.innerHeight * 0.96 * 0.75;
}

function keyUp(event){ 
    switch(event.keyCode){
        case KEY_W:{
            gameCamera.moveForward = false;
            break;
        }
        case KEY_A:{
            gameCamera.moveLeft = false;
            break;
        }
        case KEY_S:{
            gameCamera.moveBack = false;
            break;
        }
        case KEY_D:{
            gameCamera.moveRight = false;
            break;
        }
        case KEY_R:{
            gameCamera.moveUp = false;
            break;
        }
        case KEY_F:{
            gameCamera.moveDown = false;
            break;
        }
        case KEY_UP:{
            gameCamera.pitchUp = false;
            break;
        }
        case KEY_DOWN:{
            gameCamera.pitchDown = false;
            break;
        }
        case KEY_LEFT:{
            gameCamera.yawLeft = false;
            break;
        }
        case KEY_RIGHT:{
            gameCamera.yawRight = false;
            break;
        }
        case KEY_Q:{
            gameCamera.rollLeft = false;
            break;
        }
        case KEY_E:{
            gameCamera.rollRight = false;
            break;
        }
    }
}

function keyDown(event){
    switch(event.keyCode){
        case KEY_W:{
            gameCamera.moveForward = true;
            break;
        }
        case KEY_A:{
            gameCamera.moveLeft = true;
            break;
        }
        case KEY_S:{
            gameCamera.moveBack = true;
            break;
        }
        case KEY_D:{
            gameCamera.moveRight = true;
            break;
        }
        case KEY_R:{
            gameCamera.moveUp = true;
            break;
        }
        case KEY_F:{
            gameCamera.moveDown = true;
            break;
        }
        case KEY_UP:{
            gameCamera.pitchUp = true;
            break;
        }
        case KEY_DOWN:{
            gameCamera.pitchDown = true;
            break;
        }
        case KEY_LEFT:{
            gameCamera.yawLeft = true;
            break;
        }
        case KEY_RIGHT:{
            gameCamera.yawRight = true;
            break;
        }
        case KEY_Q:{
            gameCamera.rollLeft = true;
            break;
        }
        case KEY_E:{
            gameCamera.rollRight = true;
            break;
        }
    }
}