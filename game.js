var canvas;
var gl;

var buttonDiv;
var codeDiv;

var gameCamera;
var gameLight = new Vector3(50, 50, 50);

var staticMeshes = [];
var animatedMeshes = [];

var starTime = 0;
var endTime = 0;
var deltaTime = 0;

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
    gameCamera.position = new Vector3(3, 3, 5);
    gameCamera.orientation.rotate(new Vector3(1, -1, 0), 0.4);
    gameCamera.updateView();

    initSkyboxRenderer();
    initTexturedMeshRenderer();
    initAnimatedTexturedMeshRenderer();

    loadSkyboxFaceImage(skyboxImageData[0], 256, 256, "-x");
    loadSkyboxFaceImage(skyboxImageData[1], 256, 256, "+z");
    loadSkyboxFaceImage(skyboxImageData[2], 256, 256, "+x");
    loadSkyboxFaceImage(skyboxImageData[3], 256, 256, "-z");
    loadSkyboxFaceImage(skyboxImageData[4], 256, 256, "-y");
    loadSkyboxFaceImage(skyboxImageData[5], 256, 256, "+y");

    let msh = createTexturedMesh(terrainMeshData[0], terrainMeshData[1]);
    msh.textureID = generateGLTexture2D(terrainTextureData, 1024, 1024, "linear");
    msh.position = new Vector3(0, -24.6, 0);
    msh.orientation.rotate(new Vector3(1, 0, 0), Math.PI);
    staticMeshes.push(msh);

    msh = createAnimatedTexturedMesh(rockMonsterMeshData[0], rockMonsterMeshData[1]);
    msh.textureID = generateGLTexture2D(rockMonsterTextureData, 1024, 1024, "linear");
    msh.orientation.rotate(new Vector3(1, 0, 0), Math.PI);
    msh.animations["wave"] = buildAnimation(rockMonsterAnimation["wave"]);
    msh.animations["raisedaroof"] = buildAnimation(rockMonsterAnimation["raisedaroof"]);
    msh.currentAnimation = msh.animations["wave"];
    animatedMeshes.push(msh);

    startTime = new Date().getTime();
    setInterval(updateScreen, 0);
}

function updateScreen(){
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.clear(gl.DEPTH_BUFFER_BIT);

    gameCamera.updateView(deltaTime);

    renderTexturedMeshes(staticMeshes, gameCamera, gameLight);
    renderAnimatedTexturedMeshes(animatedMeshes, gameCamera, gameLight, deltaTime);
    renderSkybox(gameCamera.projectionMatrix, gameCamera.orientation);
    endTime = new Date().getTime();
    deltaTime = (endTime - startTime) / 1000.0;
    startTime = endTime;
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
    if(gl != null){
        gl.viewport(0, 0, canvas.width, canvas.height);
    }
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

var an = false;
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
        case KEY_SPACE:{
            an = !an;
            if(an){
                animatedMeshes[0].currentAnimation = animatedMeshes[0].animations["wave"];
            }else{
                animatedMeshes[0].currentAnimation = animatedMeshes[0].animations["raisedaroof"];
            }
            
            break;
        }
    }
}