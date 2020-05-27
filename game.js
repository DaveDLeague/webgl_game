const GAME_MODE_OPEN = 0
const GAME_MODE_ROAM = 1
const GAME_MODE_GHOST_APPEAR = 2
const GAME_MODE_QUESTION_ANSWER = 3
const GAME_MODE_QUESTION_RIGHT = 4
const GAME_MODE_QUESTION_WRONG = 5
const GAME_MODE_GHOST_DYING = 6
const GAME_MODE_CLICK_TO_CONT = 7

const LESS_THAN_OP = 0;
const GREATER_THAN_OP = 1;
const LESS_THAN_EQ_OP = 2;
const GREATER_THAN_EQ_OP = 3;
const EQUAL_TO_OP = 4;
const NOT_EQUAL_OP = 5;

const TOTAL_OPS = 6;
const OPS_STR = [
    "<", ">", "<=", ">=", "==", "!="
];

class Question {
    correctAnswer;
    string;
};

var currentGameMode = GAME_MODE_OPEN;

var currentQuestion;
var currentLevel;

var canvas;
var gl;

var textCanvas;
var textCtx;
var textSize;

var buttonDiv;
var codeDiv;

var trueButton;
var falseButton;

var gameCamera;
var gameLight = new Vector3(50, 50, 50);

var ghostEnabled = [];
var staticMeshes = [];
var animatedMeshes = [];
var particleEmitters = [];

var starTime = 0;
var endTime = 0;
var deltaTime = 0;

var paused = false;

var ghostParticleEmitter;
var hitParticleEmitter;

var wordSpaceTexture;
var ghostStartPos;
var ghostRelocatePos;
var ghostMesh;

var gameStarted = false;
var transitionToNextGhost = false;
var ghostSwoop = false;
var ghostShrink = false;
var swoopTime = 0;

var terrainMesh;

var mousePosition = new Vector2();
var lastMoustPosition = new Vector2();
var mouseDelta = new Vector2(0, 0);

var playerPosition = new Vector2(0, 0);
var playerVelocity = new Vector2(0, 0);

var cameraLockPosition;

var spaceDown = false;
var spaceTracker = true;
var ghostHealth;
var ghostsKilled = 0;

window.onload = function(){
    buttonDiv = document.getElementById("buttonDivID");
    canvas = document.getElementById("canvasID");
    textCanvas = document.getElementById("textCanvasID");
    textCtx = textCanvas.getContext("2d");

    window.addEventListener("resize", windowResize);
    window.addEventListener("mousedown", mousePressed);
    window.addEventListener("mousemove", mouseMoved);
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);

    buttonDiv.style.position = 'absolute';
    canvas.style.position = 'absolute';
    canvas.style.border = 'solid';
    canvas.style.cursor = 'pointer';
    textCanvas.style.position = 'absolute';
    textCanvas.style.cursor = 'pointer';

    canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;
    document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock || document.webkitExitPointerLock;


    trueButton = document.createElement('button');
    trueButton.onclick = trueButtonClicked;
    trueButton.innerHTML = "TRUE";
    trueButton.style.fontSize = '52';
    trueButton.style.border = 'solid';
    trueButton.style.borderRadius = "12px";
    trueButton.style.backgroundColor = "#FFBB00";
    buttonDiv.appendChild(trueButton);
    falseButton = document.createElement('button');
    falseButton.onclick = falseButtonClicked;
    falseButton.innerHTML = "FALSE";
    falseButton.style.fontSize = '52';
    falseButton.style.border = 'solid';
    falseButton.style.borderRadius = "12px";
    falseButton.style.backgroundColor = "#FFBB00";
    buttonDiv.appendChild(falseButton);
    buttonDiv.style.display = "none";

    windowResize();    

    textCtx.font = "50px Arial";
    textCtx.fillText("LOADING...", 100, 100);

    gl = canvas.getContext('webgl2');
    gl.clearColor(1, 1, 1, 1);  
    gl.enable(gl.DEPTH_TEST); 
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    gameCamera = new Camera();

    gameCamera.setPerspectiveProjection(70.0, canvas.width / canvas.height, 0.001, 1000.0);
    gameCamera.position = new Vector3(0, 5, 10);
    gameCamera.moveSpeed = 10;
    gameCamera.updateView();
    playerPosition = new Vector2(gameCamera.position.x, gameCamera.position.z);

    initCanvasRenderer(canvas.width, canvas.height);
    initSkyboxRenderer();
    initTexturedMeshRenderer();
    initAnimatedTexturedMeshRenderer();
    initParticleRenderer();

    loadSkyboxFaceImage(skyboxImageData[0], 256, 256, "-x");
    loadSkyboxFaceImage(skyboxImageData[1], 256, 256, "+z");
    loadSkyboxFaceImage(skyboxImageData[2], 256, 256, "+x");
    loadSkyboxFaceImage(skyboxImageData[3], 256, 256, "-z");
    loadSkyboxFaceImage(skyboxImageData[4], 256, 256, "-y");
    loadSkyboxFaceImage(skyboxImageData[5], 256, 256, "+y");

    msh = createTexturedMesh(trashCanMeshData[0], trashCanMeshData[1]);
    msh.textureID = generateGLTexture2D(trashCanTextureData, 1, 1, "linear");
    msh.position = new Vector3(0, 1.5, -20);
    msh.orientation.rotate(new Vector3(1, 0, 0), -Math.PI * 0.5);
    staticMeshes.push(msh);

    msh = createTexturedMesh(stoolMeshData[0], stoolMeshData[1]);
    msh.textureID = generateGLTexture2D(stoolTextureData, 1, 1, "linear");
    msh.position = new Vector3(20, 1.5, -15);
    msh.scale = new Vector3(0.5, 0.5, 0.5);
    msh.orientation.rotate(new Vector3(1, 0, 0), -Math.PI * 0.5);
    staticMeshes.push(msh);

    msh = createTexturedMesh(deskMeshData[0], deskMeshData[1]);
    msh.textureID = generateGLTexture2D(deskTextureData, 1, 1, "linear");
    msh.position = new Vector3(-40, 0.5, -20);
    msh.scale = new Vector3(0.5, 0.5, 0.5);
    msh.orientation.rotate(new Vector3(1, 0, 0), -Math.PI * 0.5);
    staticMeshes.push(msh);

    msh = createTexturedMesh(tableMeshData[0], tableMeshData[1]);
    msh.textureID = generateGLTexture2D(tableTextureData, 1, 1, "linear");
    msh.position = new Vector3(-10, 0.5, 30);
    msh.scale = new Vector3(0.5, 0.5, 0.5);
    msh.orientation.rotate(new Vector3(1, 0, 0), -Math.PI * 0.5);
    staticMeshes.push(msh);

    msh = createTexturedMesh(blenderMeshData[0], blenderMeshData[1]);
    msh.textureID = generateGLTexture2D(blenderTextureData, 1, 1, "linear");
    msh.position = new Vector3(35, 2, 0);
    msh.scale = new Vector3(0.5, 0.5, 0.5);
    msh.orientation.rotate(new Vector3(1, 0, 0), -Math.PI * 0.5);
    staticMeshes.push(msh);

    msh = createTexturedMesh(hammerMeshData[0], hammerMeshData[1]);
    msh.textureID = generateGLTexture2D(hammerTextureData, 1, 1, "linear");
    msh.position = new Vector3(-15, 4.5, 0);
    msh.scale = new Vector3(0.25, 0.25, 0.25);
    msh.orientation.rotate(new Vector3(1, 0, 0), Math.PI * 0.5);
    staticMeshes.push(msh);

    msh = createTexturedMesh(keyboardMeshData[0], keyboardMeshData[1]);
    msh.textureID = generateGLTexture2D(keyboardTextureData, 1, 1, "linear");
    msh.position = new Vector3(0, 1.5, 25);
    msh.scale = new Vector3(1, 1, 1);
    msh.orientation.rotate(new Vector3(1, 0, 0),-Math.PI * 0.5);
    staticMeshes.push(msh);

    msh = createTexturedMesh(mouseMeshData[0], mouseMeshData[1]);
    msh.textureID = generateGLTexture2D(mouseTextureData, 1, 1, "linear");
    msh.position = new Vector3(25, 1.5, 25);
    msh.scale = new Vector3(1, 1, 1);
    msh.orientation.rotate(new Vector3(1, 0, 0), -Math.PI * 0.5);
    staticMeshes.push(msh);

    msh = createTexturedMesh(macMeshData[0], macMeshData[1]);
    msh.textureID = generateGLTexture2D(macTextureData, 1, 1, "linear");
    msh.position = new Vector3(45, 1.5, 45);
    msh.scale = new Vector3(1, 1, 1);
    msh.orientation.rotate(new Vector3(1, 0, 0), -Math.PI * 0.5);
    staticMeshes.push(msh);

    for(let i = 0; i < staticMeshes.length; i++){
        ghostEnabled.push(true);
    }


    terrainMesh = createTexturedMesh(terrainMeshData[0], terrainMeshData[1]);
    terrainMesh.textureID = generateGLTexture2D(terrainTextureData, 1024, 1024, "linear");
    terrainMesh.position = new Vector3(0, 0, 0);

    ghostStartPos = new Vector3(0, 5, 0);
    ghostMesh = createAnimatedTexturedMesh(boo_leanMeshData[0], boo_leanMeshData[1]);
    ghostMesh.textureID = generateGLTexture2D(boo_leanTextureData, 1024, 1024, "linear");
    ghostMesh.position = new Vector3(ghostStartPos.x, ghostStartPos.y, ghostStartPos.z);
    ghostMesh.orientation.rotate(new Vector3(1, 0, 0), -Math.PI * 0.5);
    ghostMesh.animations["idle"] = buildAnimation(boo_leanAnimation["idle"]);
    ghostMesh.currentAnimation = ghostMesh.animations["idle"];
    ghostMesh.color = generateRandomGhostColor();
    animatedMeshes.push(ghostMesh);
    ghostMesh = animatedMeshes[animatedMeshes.length - 1];

    setGhostHealth();

    /////////////////////////////////////////PARTICLES///////////////////////////////////////////////////
    let ghostParticleTex = [];
    for(let i = 0; i < 16; i++){
        for(let j = 0; j < 16; j++){
            let x = 8 - i;
            let y = 8 - j;
            ghostParticleTex.push(1);
            ghostParticleTex.push(1);
            ghostParticleTex.push(1);
            if(Math.sqrt(x * x + y * y) < 8){
                ghostParticleTex.push(Math.random() * 128);
            }else{
                ghostParticleTex.push(0);
            }
            
            
        }
    }
    let ghostPartTex = generateGLTexture2D(ghostParticleTex, 16, 16);
    ghostParticleEmitter = new ParticleEmitter();
    ghostParticleEmitter.position = new Vector3(ghostMesh.position.x, ghostMesh.position.y, ghostMesh.position.z - 0.5);
    ghostParticleEmitter.repeat = true;
    for(let i = 0; i < 32; i++){
        let sc = Math.random() * 0.5;
        ghostParticleEmitter.positions.push(new Vector3(ghostParticleEmitter.position.x + randomFloatInRange(-0.5, 0.5), 
                                                        ghostParticleEmitter.position.y, 
                                                        ghostParticleEmitter.position.z + randomFloatInRange(-0.5, 0.5)));
        ghostParticleEmitter.scales.push(new Vector3(sc, sc, sc));
        ghostParticleEmitter.orientations.push(new Quaternion());
        ghostParticleEmitter.durrations.push(Math.random() + 1);
        ghostParticleEmitter.startDelays.push(Math.random());
        ghostParticleEmitter.velocities.push(new Vector3(0.1 * Math.random() - 0.05, 0.05, 0.1 * Math.random() - 0.05));
    }
    ghostParticleEmitter.updateFunction = function(p, deltaTime){
        for(let i = 0; i < p.positions.length; i++){
            if(p.startDelays[i] > ghostParticleEmitter.totalTime) continue;
            p.positions[i].x += Math.sin((ghostParticleEmitter.totalTime + p.startDelays[i]) * 10) * 0.05;
            p.positions[i].z += Math.sin((ghostParticleEmitter.totalTime - p.startDelays[i]) * 10) * 0.05;
            p.positions[i].y += deltaTime * 5;
            let sv = deltaTime * 0.2;
            p.scales[i].add(new Vector3(sv, sv, sv));
            p.durrations[i] -= deltaTime;
            if(p.durrations[i] <= 0){
                if(p.repeat){
                    p.positions[i].x = p.position.x + randomFloatInRange(-0.5, 0.5);
                    p.positions[i].y = p.position.y;
                    p.positions[i].z = p.position.z + randomFloatInRange(-0.5, 0.5);
                    p.durrations[i] = Math.random() + 1;
                    let sc = Math.random() * 0.5;
                    p.scales[i] = new Vector3(sc, sc, sc);
                }
            }
        }
        if(!p.repeat){
            let st = true;
            for(let i = 0; i < p.durrations.length; i++){
                if(p.durrations[i] > 0){
                    st = false;
                    break;
                }
            }
            if(st){
                p.discard = true;
            }
        }
    };

    ghostParticleEmitter.textureID = ghostPartTex;

    hitParticleEmitter = new ParticleEmitter();
    hitParticleEmitter.position = new Vector3(ghostMesh.position.x, ghostMesh.position.y, ghostMesh.position.z + 0.5);
    hitParticleEmitter.repeat = false;
    for(let i = 0; i < 32; i++){
        let sc = Math.random() * 0.5;
        hitParticleEmitter.positions.push(new Vector3(hitParticleEmitter.position.x + randomFloatInRange(-0.5, 0.5), 
                                                        hitParticleEmitter.position.y, 
                                                        hitParticleEmitter.position.z + randomFloatInRange(-0.5, 0.5)));
        hitParticleEmitter.scales.push(new Vector3(sc, sc, sc));
        hitParticleEmitter.orientations.push(new Quaternion());
        hitParticleEmitter.durrations.push(1);
        hitParticleEmitter.velocities.push(new Vector3(Math.random() - 0.5, 
                                                       Math.random() - 0.5, 
                                                       0.1 * Math.random() - 0.05));
    }
    hitParticleEmitter.updateFunction = function(p, deltaTime){
        for(let i = 0; i < p.positions.length; i++){
            if(p.durrations[i] > 0){
                p.positions[i].add(p.velocities[i]);
                p.velocities[i].y -= 2 * deltaTime;
                let sv = deltaTime * 0.2;
                p.scales[i].add(new Vector3(sv, sv, sv));
                p.durrations[i] -= deltaTime;
            }
            if(!p.repeat){
                let st = true;
                for(let j = 0; j < p.durrations.length; j++){
                    if(p.durrations[j] > 0){
                        st = false;
                        break;
                    }
                }
                if(st){
                    p.discard = true;
                    for(let j = 0; j < p.durrations.length; j++){
                        p.positions[j].x = hitParticleEmitter.position.x + randomFloatInRange(-0.5, 0.5);
                        p.positions[j].y = hitParticleEmitter.position.y;
                        p.positions[j].z = hitParticleEmitter.position.z + randomFloatInRange(-0.5, 0.5);
                        p.velocities[j].x = Math.random() - 0.5;
                        p.velocities[j].y = Math.random() - 0.5;
                        p.velocities[j].z = 0.1 * Math.random() - 0.05;
                        let sc = Math.random() * 0.5;
                        p.scales[j].x = sc;
                        p.scales[j].y = sc;
                        p.scales[j].z = sc;
                        p.durrations[j] = 1;
                    }
                }
            }
        }
    };

    particleEmitters.push(ghostParticleEmitter);
    ghostParticleEmitter =  particleEmitters[particleEmitters.length - 1];
    ghostParticleEmitter.color = new Vector4(ghostMesh.color.x, ghostMesh.color.y, ghostMesh.color.x, ghostMesh.color.w);

    /////////////////////////////////////////PARTICLES///////////////////////////////////////////////////
    currentLevel = 1;
    currentQuestion = generateQuestion(currentLevel);

    wordSpaceTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, wordSpaceTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 32, 32, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(wordSpace));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    startTime = new Date().getTime();
    interval = setInterval(updateScreen, 0);
}

function updateScreen(){
    textCtx.clearRect(0, 0, textCanvas.width, textCanvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.clear(gl.DEPTH_BUFFER_BIT);

    switch(currentGameMode){
        case GAME_MODE_OPEN :{
            textCtx.clearRect(0, 0, textCanvas.width, textCanvas.height);
            textCtx.font = "100px Arial";
            textCtx.fillText("Hunt down all of the BOO-LEANS!!", 100, 100);
            textCtx.font = "50px Arial";
            textCtx.fillText("Use WASD to move and the mouse to look around.", 200, 200);
            textCtx.fillText("When facing an object, CLICK or press SPACE to reveal a ghost.", 200, 300);
            textCtx.fillText("Answer all of its questions correctly to vanish it.", 200, 400);
            textCtx.fillText("Click Anywhere To Begin", 200, 500);
            textCtx.font = "30px Arial";
            textCtx.fillText("(place holder)", 300, 600);
            break;
        }
        case GAME_MODE_ROAM :{
            textCtx.font = "50px Arial";
            let vv = Vector3.normal(new Vector3(gameCamera.forward.x, 0, gameCamera.forward.z));
            textCtx.fillText("" + Vector3.dot(new Vector3(0, 0, 1), vv), 200, 200);
            if(gameCamera.moveForward){
                let dir = new Vector3(gameCamera.forward.x, 0, gameCamera.forward.z);
                gameCamera.position.add(Vector3.scale(dir, deltaTime * gameCamera.moveSpeed));
            }
            if(gameCamera.moveBack){
                let dir = new Vector3(gameCamera.forward.x, 0, gameCamera.forward.z);
                gameCamera.position.add(Vector3.scale(dir, -deltaTime * gameCamera.moveSpeed));
            }
            if(gameCamera.moveLeft){
                let dir = new Vector3(gameCamera.right.x, 0, gameCamera.right.z);
                gameCamera.position.add(Vector3.scale(dir, -deltaTime * gameCamera.moveSpeed));
            }
            if(gameCamera.moveRight){
                let dir = new Vector3(gameCamera.right.x, 0, gameCamera.right.z);
                gameCamera.position.add(Vector3.scale(dir, deltaTime * gameCamera.moveSpeed));
            }
            if(gameCamera.moveUp){
                gameCamera.position.add(Vector3.scale(gameCamera.up, deltaTime * gameCamera.moveSpeed));
            }
            if(gameCamera.moveDown){
                gameCamera.position.add(Vector3.scale(gameCamera.up, -deltaTime * gameCamera.moveSpeed));
            }
            handleCollisions();
            if(spacePressed()){
                checkForGhostArrival();
            } 
            gameCamera.updateView(deltaTime);
            updateParticles([ghostParticleEmitter], deltaTime);
            renderSkybox(gameCamera.projectionMatrix, gameCamera.orientation);
            playerPosition = new Vector2(gameCamera.position.x, gameCamera.position.z);
            renderTexturedMeshes(staticMeshes, gameCamera, gameLight);
            renderTexturedMeshes([terrainMesh], gameCamera, gameLight);
            break;
        }
        case GAME_MODE_GHOST_APPEAR :{
            gameCamera.lookAt(cameraLockPosition, ghostMesh.position, new Vector3(0, 1, 0));
            ghostParticleEmitter.position = ghostMesh.position;
            renderSkybox(gameCamera.projectionMatrix, gameCamera.orientation);
            renderTexturedMeshes(staticMeshes, gameCamera, gameLight);
            renderTexturedMeshes([terrainMesh], gameCamera, gameLight);
            updateAnimations(animatedMeshes, deltaTime);
            renderAnimatedTexturedMeshes([ghostMesh], gameCamera, gameLight, deltaTime);
            updateParticles([ghostParticleEmitter], deltaTime);
            renderParticles([ghostParticleEmitter], gameCamera, deltaTime);
            ghostMesh.position.y += deltaTime * 5;
            if(ghostMesh.position.y > 7){
                windowResizeWithButtons();
                trueButton.disabled = false;
                falseButton.disabled = false;
                buttonDiv.style.display = "block";
                currentGameMode = GAME_MODE_QUESTION_ANSWER;
                canvas.style.cursor = "pointer";
                textCanvas.style.cursor = "pointer";
                document.exitPointerLock();
            }
            break;
        }
        case GAME_MODE_QUESTION_ANSWER :{  
            gameCamera.lookAt(cameraLockPosition, ghostMesh.position, new Vector3(0, 1, 0));
            renderSkybox(gameCamera.projectionMatrix, gameCamera.orientation);
            renderTexturedMeshes(staticMeshes, gameCamera, gameLight);
            renderTexturedMeshes([terrainMesh], gameCamera, gameLight);
            updateAnimations(animatedMeshes, deltaTime);
            renderAnimatedTexturedMeshes([ghostMesh], gameCamera, gameLight, deltaTime);
            updateParticles(particleEmitters, deltaTime);
            renderParticles(particleEmitters, gameCamera, deltaTime);
            renderCanvasItems();
    
            textCtx.font = textSize + "px Arial";
            let qlines = currentQuestion.string.split("\n");
            for(let i = 0; i < qlines.length; i++){
                let tx = (textCanvas.width * 0.5) - ((qlines[i].length * (textSize * 0.4) * 0.5));
                if(i == qlines.length - 1){
                    textCtx.fillText(qlines[i] + "?", tx, textSize * (i + 1));
                }else{
                    textCtx.fillText(qlines[i], tx, textSize * (i + 1));
                }
            }
            break;
        }
        case GAME_MODE_QUESTION_WRONG :{
            gameCamera.lookAt(cameraLockPosition, ghostMesh.position, new Vector3(0, 1, 0));
            renderSkybox(gameCamera.projectionMatrix, gameCamera.orientation);
            renderTexturedMeshes(staticMeshes, gameCamera, gameLight);
            renderTexturedMeshes([terrainMesh], gameCamera, gameLight);
            updateAnimations(animatedMeshes, deltaTime);
            renderAnimatedTexturedMeshes([ghostMesh], gameCamera, gameLight, deltaTime);
            updateParticles([ghostParticleEmitter, hitParticleEmitter], deltaTime);
            renderParticles([ghostParticleEmitter, hitParticleEmitter], gameCamera, deltaTime);
            renderCanvasItems();
            break;
        }
        case GAME_MODE_QUESTION_RIGHT :{
            gameCamera.lookAt(cameraLockPosition, ghostMesh.position, new Vector3(0, 1, 0));
            renderSkybox(gameCamera.projectionMatrix, gameCamera.orientation);
            renderTexturedMeshes(staticMeshes, gameCamera, gameLight);
            renderTexturedMeshes([terrainMesh], gameCamera, gameLight);
            updateAnimations(animatedMeshes, deltaTime);
            renderAnimatedTexturedMeshes([ghostMesh], gameCamera, gameLight, deltaTime);
            updateParticles([ghostParticleEmitter, hitParticleEmitter], deltaTime);
            renderParticles([ghostParticleEmitter, hitParticleEmitter], gameCamera, deltaTime);
            renderCanvasItems();

            trueButton.disabled = false;
            falseButton.disabled = false;
            currentGameMode = GAME_MODE_QUESTION_ANSWER;
            break;
        }
        case GAME_MODE_GHOST_DYING :{
            ghostMesh.position.y -= deltaTime * 5;
            ghostMesh.orientation.rotate(new Vector3(0, 1, 0), deltaTime);

            if(ghostMesh.position.y <= -7){
                ghostMesh.orientation = new Quaternion();
                ghostMesh.orientation.rotate(new Vector3(1, 0, 0), Math.PI);
                currentGameMode = GAME_MODE_CLICK_TO_CONT;
            }

            gameCamera.lookAt(cameraLockPosition, ghostMesh.position, new Vector3(0, 1, 0));
            renderSkybox(gameCamera.projectionMatrix, gameCamera.orientation);
            renderTexturedMeshes(staticMeshes, gameCamera, gameLight);
            renderTexturedMeshes([terrainMesh], gameCamera, gameLight);
            updateAnimations(animatedMeshes, deltaTime);
            renderAnimatedTexturedMeshes([ghostMesh], gameCamera, gameLight, deltaTime);
            updateParticles([ghostParticleEmitter, hitParticleEmitter], deltaTime);
            renderParticles([ghostParticleEmitter, hitParticleEmitter], gameCamera, deltaTime);
            break;
        }
        case GAME_MODE_CLICK_TO_CONT :{
            gameCamera.lookAt(cameraLockPosition, Vector3.add(cameraLockPosition, gameCamera.forward), new Vector3(0, 1, 0));
            renderSkybox(gameCamera.projectionMatrix, gameCamera.orientation);
            renderTexturedMeshes(staticMeshes, gameCamera, gameLight);
            renderTexturedMeshes([terrainMesh], gameCamera, gameLight);
            renderCanvasItems();
            textCtx.font = "100px Arial";
            textCtx.fillText("Click Anywhere to Continue", 300, 100);
            break;
        }
    }
    
    endTime = new Date().getTime();
    deltaTime = (endTime - startTime) / 1000.0;
    startTime = endTime;
}

function renderCanvasItems(){
    renderQuad(new Vector2(0, canvas.height - (canvas.height / 10)), new Vector2(canvas.width, canvas.height / 4), new Vector4(1, 1, 1, 1), wordSpaceTexture);
}

function handleCollisions(){
    for(let i = 0; i < staticMeshes.length; i++){
        let hsx = 5;
        let hsz = 5;
        let xmin = staticMeshes[i].position.x - hsx;
        let xmax = staticMeshes[i].position.x + hsx;
        let zmin = staticMeshes[i].position.z - hsz;
        let zmax = staticMeshes[i].position.z + hsz;
        if(gameCamera.position.x < xmin || gameCamera.position.x > xmax
        || gameCamera.position.z < zmin || gameCamera.position.z > zmax){
            continue;
        }else{
            if(gameCamera.position.x > xmin && gameCamera.position.x < staticMeshes[i].position.x){
                gameCamera.position.x = xmin;
            }
            else if(gameCamera.position.x < xmax && gameCamera.position.x > staticMeshes[i].position.x){
                gameCamera.position.x = xmax;
            }
            if(gameCamera.position.z > zmin && gameCamera.position.z < staticMeshes[i].position.z){
                gameCamera.position.z = zmin;
            }
            else if(gameCamera.position.z < zmax && gameCamera.position.z > staticMeshes[i].position.z){
                gameCamera.position.z = zmax;
            }
            break;
        } 
    }
}

function checkForGhostArrival(){
    for(let i = 0; i < staticMeshes.length; i++){
        if(!ghostEnabled[i]){
            continue;
        }
        let pos = staticMeshes[i].position;
        let spos = Vector3.add(gameCamera.position, gameCamera.forward);
        let len = Vector3.length(Vector3.sub(pos, spos));
        if(len < 7){
            ghostMesh.orientation = new Quaternion();
            let vv = Vector3.normal(new Vector3(gameCamera.forward.x, 0, gameCamera.forward.z));
            ghostMesh.orientation.rotate(new Vector3(0, 1, 0), (Vector3.dot(new Vector3(0, 0, 1), vv) + 1) * -Math.PI * 0.5);
            ghostMesh.orientation.rotate(new Vector3(1, 0, 0), -Math.PI * 0.5);
            
            ghostMesh.color = generateRandomGhostColor();
            ghostMesh.position = new Vector3(pos.x, pos.y, pos.z);
            ghostMesh.position.y -= 3;
            ghostParticleEmitter.position = new Vector3(pos.x, pos.y, pos.z);
            currentGameMode = GAME_MODE_GHOST_APPEAR;
            updateParticles([ghostParticleEmitter], 0);
            cameraLockPosition = new Vector3(gameCamera.position.x, gameCamera.position.y, gameCamera.position.z);
            ghostEnabled[i] = false;
            break;
        }
    }
}

function windowResizeWithButtons(){
    buttonDiv.style.top = window.innerHeight - (window.innerHeight * 0.125)
    buttonDiv.style.width = window.innerWidth * 0.98;
    buttonDiv.style.height = window.innerHeight * 0.96 * 0.125;
    canvas.width = window.innerWidth * 0.98;
    canvas.height = window.innerHeight * 0.96 * 0.875;
    textCanvas.width = window.innerWidth * 0.98;
    textCanvas.height = window.innerHeight * 0.96 * 0.875;
    trueButton.style.width = canvas.width * 0.5;
    trueButton.style.height = buttonDiv.style.height;
    falseButton.style.width = canvas.width * 0.5;
    falseButton.style.height = buttonDiv.style.height;
    if(gl != null){
        gl.viewport(canvas.style.left, canvas.style.bottom, canvas.width, canvas.height);
    }
}

function windowResize(){
    buttonDiv.style.top = window.innerHeight - (window.innerHeight * 0.125)
    buttonDiv.style.width = window.innerWidth * 0.98;
    buttonDiv.style.height = window.innerHeight * 0.96 * 0.125;
    canvas.width = window.innerWidth * 0.98;
    canvas.height = window.innerHeight * 0.96;
    textCanvas.width = window.innerWidth * 0.98;
    textCanvas.height = window.innerHeight * 0.96;
    if(gl != null){
        gl.viewport(canvas.style.left, canvas.style.bottom, canvas.width, canvas.height);
    }
}

function generateQuestion(level){
    switch(level){
        case 1:{
            textSize = 60;
            let q = new Question();
            let l = Math.floor(Math.random() * 100);
            let r = Math.floor(Math.random() * 100);
            let op = getRandomRelationalOperator();

            q.string = l + " " + op + " " +r;
            q.answer = eval(q.string);
            
            return q;
        }
        case 2:{
            textSize = 40;
            let q = new Question();
            let x = Math.floor(Math.random() * 100);
            let r = Math.floor(Math.random() * 100);
            let op = getRandomRelationalOperator();

            q.string = "x = ";
            q.string += x + ";\n";
            q.string += "x " + op + " " + r;
            q.answer = eval(q.string);
            
            return q;
        }
        case 3:{
            textSize = 40;
            let q = new Question();
            let x = Math.floor(Math.random() * 100);
            let y = Math.floor(Math.random() * 100);
            let op = getRandomRelationalOperator();

            q.string = "x = ";
            q.string += x + ";\n";
            q.string += "y = ";
            q.string += y + ";\n";
            q.string += "x " + op + " y";
            q.answer = eval(q.string);
            
            return q;
        }
        case 4:{
            textSize = 35;
            let q = new Question();
            let x = Math.floor(Math.random() * 100);
            let y = Math.floor(Math.random() * 100);
            let z = Math.floor(Math.random() * 100);
            let op1 = getRandomRelationalOperator();
            let op2 = getRandomRelationalOperator();
            let op3 = getRandomLogicalOperator();

            q.string = "x = " + x + ";\n";
            q.string += "y = " + y + ";\n";
            q.string += "(x " + op1 + " y) " + op3 + " (y " + op2 + " " + z +")";
            q.answer = eval(q.string);
            
            return q;
        }
        case 5:{
            textSize = 35;
            let q = new Question();
            let x = Math.floor(Math.random() * 100);
            let y = Math.floor(Math.random() * 100);
            let op1 = getRandomRelationalOperator();
            let op2 = getRandomRelationalOperator();
            let op3 = getRandomLogicalOperator();

            q.string = "x = " + x + ";\n";
            q.string += "y = " + y + ";\n";
            q.string += "(x " + op1 + " y) " + op3 + " (y " + op2 + " x)";
            q.answer = eval(q.string);
            
            return q;
        }
        case 6:{
            textSize = 35;
            let q = new Question();
            let x = Math.floor(Math.random() * 100);
            let y = Math.floor(Math.random() * 100);
            let z = Math.floor(Math.random() * 100);
            let op1 = getRandomRelationalOperator();
            let op2 = getRandomRelationalOperator();
            let op3 = getRandomLogicalOperator();

            q.string = "x = " + x + ";\n";
            q.string += "y = " + y + ";\n";
            q.string += "z = " + z + ";\n";
            q.string += "(x " + op1 + " y) " + op3 + " (x " + op2 + " z)";
            q.answer = eval(q.string);
            
            return q;
        }
        case 7:{
            textSize = 30;
            let q = new Question();
            let w = Math.floor(Math.random() * 100);
            let x = Math.floor(Math.random() * 100);
            let y = Math.floor(Math.random() * 100);
            let z = Math.floor(Math.random() * 100);
            let op1 = getRandomRelationalOperator();
            let op2 = getRandomRelationalOperator();
            let op3 = getRandomLogicalOperator();

            let arr = ["w", "x", "y", "z"];
            shuffleArray(arr);

            q.string = "w = " + w + ";\n";
            q.string += "x = " + x + ";\n";
            q.string += "y = " + y + ";\n";
            q.string += "z = " + z + ";\n";
            q.string += "(" + arr[0] + " " + op1 + " " + arr[1] + ") " + op3 + " (" + arr[2] + " " + op2 + " " + arr[3] + ")";
            q.answer = eval(q.string);

            return q;
        }
        case 8:{
            textSize = 25;
            let q = new Question();
            let w = Math.floor(Math.random() * 100);
            let x = Math.floor(Math.random() * 100);
            let y = Math.floor(Math.random() * 100);
            let z = Math.floor(Math.random() * 100);
            let op1 = getRandomRelationalOperator();
            let op2 = getRandomRelationalOperator();
            let op3 = getRandomRelationalOperator();
            let lop1 = getRandomLogicalOperator();
            let lop2 = getRandomLogicalOperator();

            let arr = ["w", "x", "y", "z"];
            shuffleArray(arr);

            q.string = "w = " + w + ";\n";
            q.string += "x = " + x + ";\n";
            q.string += "y = " + y + ";\n";
            q.string += "z = " + z + ";\n";
            q.string += "((" + arr[0] + " " + op1 + " " + arr[1] + ") " + lop1 + " (" + arr[2] + " " + op2 + " " + arr[3] + ")) " 
                             + lop2 + " (" +  arr[0] + " " + op3 + " " + arr[3] + ")";
            q.answer = eval(q.string);

            return q;
        }
        case 9:{
            textSize = 20;
            let q = new Question();
            let w = Math.floor(Math.random() * 100);
            let x = Math.floor(Math.random() * 100);
            let y = Math.floor(Math.random() * 100);
            let z = Math.floor(Math.random() * 100);
            let op1 = getRandomRelationalOperator();
            let op2 = getRandomRelationalOperator();
            let op3 = getRandomRelationalOperator();
            let op4 = getRandomRelationalOperator();
            let lop1 = getRandomLogicalOperator();
            let lop2 = getRandomLogicalOperator();
            let lop3 = getRandomLogicalOperator();

            let arr = ["w", "x", "y", "z"];
            shuffleArray(arr);

            q.string = "w = " + w + ";\n";
            q.string += "x = " + x + ";\n";
            q.string += "y = " + y + ";\n";
            q.string += "z = " + z + ";\n";
            q.string += "((" + arr[0] + " " + op1 + " " + arr[1] + ") " + lop1 + " (" + arr[2] + " " + op2 + " " + arr[3] + ")) " 
               + lop2 + " ((" + arr[2] + " " + op3 + " " + arr[1] + ") " + lop3 + " (" + arr[3] + " " + op4 + " " + arr[0] + ")) "
            q.answer = eval(q.string);

            return q;
        }
        case 10:{
            textSize = 20;
            let q = new Question();
            let w = Math.floor(Math.random() * 100);
            let x = Math.floor(Math.random() * 100);
            let y = Math.floor(Math.random() * 100);
            let z = Math.floor(Math.random() * 100);
            let op1 = getRandomRelationalOperator();
            let op2 = getRandomRelationalOperator();
            let op3 = getRandomRelationalOperator();
            let op4 = getRandomRelationalOperator();
            let lop1 = getRandomLogicalOperator();
            let lop2 = getRandomLogicalOperator();
            let lop3 = getRandomLogicalOperator();
            let lop4 = getRandomLogicalOperator();
            let lop5 = getRandomLogicalOperator();
            let tf1 = Math.random() < 0.5 ? "true" : "false";
            let tf2 = Math.random() < 0.5 ? "true" : "false";

            let arr = ["w", "x", "y", "z"];
            shuffleArray(arr);

            q.string = "w = " + w + ";\n";
            q.string += "x = " + x + ";\n";
            q.string += "y = " + y + ";\n";
            q.string += "z = " + z + ";\n";
            q.string += "(((" + arr[0] + " " + op1 + " " + arr[1] + ") " + lop1 + " (" + arr[2] + " " + op2 + " " + arr[3] + ")) " + lop4 + " " + tf1 + ") "
               + lop2 + " (((" + arr[2] + " " + op3 + " " + arr[1] + ") " + lop3 + " (" + arr[3] + " " + op4 + " " + arr[0] + ")) " + lop5 + " " + tf2 + ") "
            q.answer = eval(q.string);

            return q;
        }
        default:{
            return generateQuestion(1);
        }

    }
}

function shuffleArray(arr){
    let l = arr.length;
    for(let i = 0; i < l; i++){
        let rnd = Math.floor(Math.random() * (l - i)) + i;
        let tmp = arr[i];
        arr[i] = arr[rnd];
        arr[rnd] = tmp;
    }
}

function getRandomLogicalOperator(){
    return Math.random() < 0.5 ? "&&" : "||";
}

function getRandomRelationalOperator(){
    return OPS_STR[Math.floor(Math.random() * TOTAL_OPS)];
}

function checkAnswer(actual, correct){
    if(actual == correct){
        currentLevel++;
        hitParticleEmitter.position = new Vector3(ghostMesh.position.x, ghostMesh.position.y, ghostMesh.position.z);
        ghostHealth -= 1;
        trueButton.disabled = true;
        falseButton.disabled = true;
        particleEmitters = [ghostParticleEmitter, hitParticleEmitter];

        if(ghostHealth <= 0){
            buttonDiv.style.display = "none";
            windowResize();
            ghostsKilled += 1;
            setGhostHealth();
            currentLevel = 1;
            currentGameMode = GAME_MODE_GHOST_DYING;
        }else{
            currentGameMode = GAME_MODE_QUESTION_RIGHT;
        }
    }else{
        currentLevel = 1;
        currentGameMode = GAME_MODE_QUESTION_WRONG;
    }
    currentQuestion = generateQuestion(currentLevel);
}

function trueButtonClicked(){
    checkAnswer(true, currentQuestion.answer);
}

function falseButtonClicked(){
    checkAnswer(false, currentQuestion.answer);
}

function generateRandomGhostColor(){
    return new Vector4(Math.random(),
                       Math.random(),
                       Math.random(),
                       (Math.random() * 0.5) + 0.5);
}

function spacePressed(){
    if(spaceDown && spaceTracker){
        spaceTracker = false;
        return true;
    }else if(!spaceDown){
        spaceTracker = true;
    }
    return false;
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
            //gameCamera.moveUp = false;
            break;
        }
        case KEY_F:{
            //gameCamera.moveDown = false;
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
        case KEY_SPACE:{
            spaceDown = false;
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
            //gameCamera.moveUp = true;
            break;
        }
        case KEY_F:{
            //gameCamera.moveDown = true;
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
            spaceDown = true;
            break;
        }
        case KEY_P:{
            paused = !paused;
        }
    }
}

function mousePressed(event){
    if(currentGameMode == GAME_MODE_ROAM){
        checkForGhostArrival();
    }
    else if(currentGameMode == GAME_MODE_OPEN){
        currentGameMode = GAME_MODE_ROAM;
        gameStarted = true;
        canvas.requestPointerLock();
    }
    else if(currentGameMode == GAME_MODE_CLICK_TO_CONT){
        canvas.style.cursor = "none";
        textCanvas.style.cursor = "none";
        currentGameMode = GAME_MODE_ROAM;
        gameCamera.position = cameraLockPosition;
        canvas.requestPointerLock();
    }
}

function mouseMoved(event){
    if(currentGameMode == GAME_MODE_ROAM){
        mousePosition = Vector2.add(mousePosition, new Vector2(event.movementX, event.movementY));
        mouseDelta = new Vector2(mousePosition.x - lastMoustPosition.x, mousePosition.y - lastMoustPosition.y);
        lastMoustPosition = new Vector2(mousePosition.x, mousePosition.y);
        let nr = new Vector3(gameCamera.right.x, 0, gameCamera.right.z);
        nr.normalize();

        gameCamera.orientation.rotate(gameCamera.forward, Vector3.dot(nr, gameCamera.up));
        gameCamera.orientation.rotate(nr, deltaTime * gameCamera.rotateSpeed * mouseDelta.y * gameCamera.mouseSensitivity);
        gameCamera.orientation.rotate(new Vector3(0, 1, 0), deltaTime * gameCamera.rotateSpeed * mouseDelta.x * gameCamera.mouseSensitivity);
    }
}

function setGhostHealth(){
    ghostHealth = ghostsKilled + 1;
}