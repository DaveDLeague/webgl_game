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
}

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

var staticMeshes = [];
var animatedMeshes = [];
var particleEmitters = [];

var starTime = 0;
var endTime = 0;
var deltaTime = 0;

var paused = false;

var ghostParticleEmitter;
var hitParticleEmitter;

var blueGradiantPixels = [0, 14, 68, 255, 0, 14, 68, 255, 2, 16, 72, 255, 11, 25, 90, 255, 19, 34, 108, 255, 28, 43, 126, 255, 37, 52, 143, 255, 46, 60, 161, 255, 0, 14, 68, 255, 1, 16, 70, 255, 10, 25, 87, 255, 19, 33, 105, 255, 27, 42, 123, 255, 36, 50, 141, 255, 44, 59, 158, 255, 53, 68, 176, 255, 0, 14, 68, 255, 9, 23, 85, 255, 17, 31, 103, 255, 26, 41, 121, 255, 35, 50, 138, 255, 43, 58, 156, 255, 52, 67, 174, 255, 60, 76, 191, 255, 8, 22, 83, 255, 16, 31, 100, 255, 25, 39, 119, 255, 33, 48, 136, 255, 42, 57, 153, 255, 50, 65, 171, 255, 60, 74, 189, 255, 68, 84, 206, 255, 15, 30, 98, 255, 24, 38, 116, 255, 32, 47, 133, 255, 41, 56, 151, 255, 50, 65, 169, 255, 59, 73, 186, 255, 67, 82, 205, 255, 76, 91, 222, 255, 22, 37, 113, 255, 31, 46, 131, 255, 40, 54, 149, 255, 48, 63, 166, 255, 58, 72, 185, 255, 66, 81, 202, 255, 75, 90, 220, 255, 83, 99, 238, 255, 29, 44, 128, 255, 38, 54, 147, 255, 47, 63, 164, 255, 56, 71, 182, 255, 65, 80, 199, 255, 73, 88, 218, 255, 82, 97, 235, 255, 91, 107, 252, 255, 37, 53, 144, 255, 46, 61, 161, 255, 55, 70, 179, 255, 63, 79, 197, 255, 72, 88, 215, 255, 81, 97, 232, 255, 89, 105, 250, 255, 92, 107, 255, 255];
var healthBarTexture;

var wordSpaceTexture;

window.onload = function(){
    buttonDiv = document.getElementById("buttonDivID");
    canvas = document.getElementById("canvasID");
    textCanvas = document.getElementById("textCanvasID");
    textCtx = textCanvas.getContext("2d");

    window.addEventListener("resize", windowResize);
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);

    buttonDiv.style.position = 'absolute';
    canvas.style.position = 'absolute';
    canvas.style.border = 'solid';
    textCanvas.style.position = 'absolute';

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

    windowResize();    

    gl = canvas.getContext('webgl2');
    gl.clearColor(0, 1, 1, 1);  
    gl.enable(gl.DEPTH_TEST); 
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    gameCamera = new Camera();

    gameCamera.setPerspectiveProjection(70.0, canvas.width / canvas.height, 0.001, 1000.0);
    gameCamera.position = new Vector3(0, 0, 10);
    gameCamera.moveSpeed = 10;
    gameCamera.updateView();

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

    let msh = createTexturedMesh(terrainMeshData[0], terrainMeshData[1]);
    msh.textureID = generateGLTexture2D(terrainTextureData, 1024, 1024, "linear");
    msh.position = new Vector3(0, -24.6, 0);
    msh.orientation.rotate(new Vector3(1, 0, 0), Math.PI);
    staticMeshes.push(msh);

    msh = createAnimatedTexturedMesh(boo_leanMeshData[0], boo_leanMeshData[1]);
    msh.textureID = generateGLTexture2D(boo_leanTextureData, 1024, 1024, "linear");
    msh.orientation.rotate(new Vector3(1, 0, 0), Math.PI);
    msh.animations["idle"] = buildAnimation(boo_leanAnimation["idle"]);
    //msh.animations["raisedaroof"] = buildAnimation(rockMonsterAnimation["raisedaroof"]);
    msh.currentAnimation = msh.animations["idle"];
    animatedMeshes.push(msh);

    /////////////////////////////////////////PARTICLES///////////////////////////////////////////////////
    let ghostParticleTex = [];
    for(let i = 0; i < 64; i++){
        ghostParticleTex.push(0);
        ghostParticleTex.push(0);
        ghostParticleTex.push(0);
        ghostParticleTex.push(Math.random() * 25);
    }
    let ghostPartTex = generateGLTexture2D(ghostParticleTex, 8, 8);
    ghostParticleEmitter = new ParticleEmitter();
    ghostParticleEmitter.position = new Vector3(msh.position.x, msh.position.y, msh.position.z - 0.5);
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
    hitParticleEmitter.position = new Vector3(msh.position.x, msh.position.y, msh.position.z + 0.5);
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

    /////////////////////////////////////////PARTICLES///////////////////////////////////////////////////
    currentLevel = 1;
    currentQuestion = generateQuestion(currentLevel);

    healthBarTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, healthBarTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 8, 8, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(blueGradiantPixels));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

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
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.clear(gl.DEPTH_BUFFER_BIT);

    gameCamera.updateView(deltaTime);

    if(!paused){
        updateParticles(particleEmitters, deltaTime);
        updateAnimations(animatedMeshes, deltaTime);
    }

    renderSkybox(gameCamera.projectionMatrix, gameCamera.orientation);
    //renderTexturedMeshes(staticMeshes, gameCamera, gameLight);
    renderAnimatedTexturedMeshes(animatedMeshes, gameCamera, gameLight, deltaTime);
    renderParticles(particleEmitters, gameCamera, deltaTime);

    renderCanvasItems();

    textCtx.clearRect(0, 0, textCanvas.width, textCanvas.height);
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
    
    endTime = new Date().getTime();
    deltaTime = (endTime - startTime) / 1000.0;
    startTime = endTime;
}

function renderCanvasItems(){
    let w = canvas.width * 0.9;
    let h = canvas.height * 0.2;
    let l = (canvas.width - w) * 0.5;
    let b = (canvas.height - h) * 0.1;

    let nw = (w * 0.95) * ((10.0 - (currentLevel - 1)) / 10.0);
    let nh = h * 0.9;
    let nl = l + (nw * 0.025);
    let nb = b + (nh * 0.05);

    renderQuad(new Vector2(0, canvas.height - (canvas.height / 4)), new Vector2(canvas.width, canvas.height / 4), new Vector4(1, 1, 1, 1), wordSpaceTexture);

    renderQuad(new Vector2(nl, nb), new Vector2(nw, nh), new Vector4(1, 1, 1, 0.8), healthBarTexture);
    renderQuad(new Vector2(l, b), new Vector2(w, h), new Vector4(0, 0, 0, 0.8));
}

function windowResize(){
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

function trueButtonClicked(){
    if(currentQuestion.answer){
        currentLevel++;
        particleEmitters.push(hitParticleEmitter);
    }else{
        currentLevel = 1;
    }
    currentQuestion = generateQuestion(currentLevel);
}

function falseButtonClicked(){
    if(!currentQuestion.answer){
        currentLevel++;
        particleEmitters.push(hitParticleEmitter);
    }else{
        currentLevel = 1;
    }
    currentQuestion = generateQuestion(currentLevel);
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
        case KEY_SPACE:{
            break;
        }
        case KEY_P:{
            paused = !paused;
        }
    }
}