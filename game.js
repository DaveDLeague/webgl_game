var canvas;
var gl;

var buttonDiv;
var codeDiv;

var gameCamera;
var gameLight = new Vector3(50, 50, 50);

var staticMeshes = [];
var animatedMeshes = [];
var particleEmitters = [];

var starTime = 0;
var endTime = 0;
var deltaTime = 0;

var pe, pe2, pe3, pe4;

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
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  

    gameCamera = new Camera();

    gameCamera.setPerspectiveProjection(70.0, canvas.width / canvas.height, 0.001, 1000.0);
    gameCamera.position = new Vector3(0, 3, 10);
    gameCamera.updateView();

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

    ///////////////////////////////////////////PARTICLES///////////////////////////////////////////////////
    pe = new ParticleEmitter();
    pe2 = new ParticleEmitter();
    pe.position = new Vector3(3, 3, 0);
    pe2.position = new Vector3(-3, 3, 0);
    pe.repeat = true;
    pe2.repeat = true;
    for(let i = 0; i < 100; i++){
        pe.positions.push(new Vector3(pe.position.x, pe.position.y, pe.position.z));
        let sc = Math.random() * 0.5;
        pe.scales.push(new Vector3(sc, sc, sc));
        pe.orientations.push(new Quaternion());
        pe.durrations.push(1);
        pe.velocities.push(new Vector3(0.1 * Math.random() - 0.05, 0.05, 0.1 * Math.random() - 0.05));

        pe2.positions.push(new Vector3(pe2.position.x, pe2.position.y, pe2.position.z));
        sc = Math.random() * 0.5;
        pe2.scales.push(new Vector3(sc, sc, sc));
        pe2.orientations.push(new Quaternion());
        pe2.durrations.push(1);
        pe2.velocities.push(new Vector3(0.1 * Math.random() - 0.05, 0.05, 0.1 * Math.random() - 0.05));
    }
    pe.updateFunction = function(p, deltaTime){
        for(let i = 0; i < p.positions.length; i++){
            p.positions[i].add(p.velocities[i]);
            p.durrations[i] -= deltaTime;
            if(p.durrations[i] <= 0){
                if(p.repeat){
                    p.positions[i].x = p.position.x;
                    p.positions[i].y = p.position.y;
                    p.positions[i].z = p.position.z;
                    p.durrations[i] = 1;
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
    pe.textureID = paDefaultTexture;
    pe2.textureID = paDefaultTexture;
    pe2.updateFunction = pe.updateFunction;


    let grassTex = [
        0,0,0,0, 0,0,0,0, 0,0,0,0, 0, 255, 0, 255,
        0,0,0,0, 0,0,0,0, 0, 220, 0, 255, 0,0,0,0,
        0,0,0,0, 0, 180, 0, 255, 0,0,0,0, 0,0,0,0,
        0, 160, 0, 255, 0,0,0,0, 0,0,0,0, 0,0,0,0,
    ];

    pe3 = new ParticleEmitter();
    pe4 = new ParticleEmitter();
    pe3.textureID = this.generateGLTexture2D(grassTex, 4, 4);
    pe4.textureID = pe3.textureID;
    pe3.position = new Vector3(3, 1, 0);
    pe3.repeat = true;
    pe4.position = new Vector3(-3, 1, 0);
    pe4.repeat = true;
    for(let i = 0; i < 30; i++){
        pe3.positions.push(new Vector3(pe3.position.x, pe3.position.y, pe3.position.z));
        let sc = Math.random() * 0.5;
        pe3.scales.push(new Vector3(sc, sc, sc));
        pe3.orientations.push(new Quaternion());
        pe3.durrations.push(1);
        pe3.velocities.push(new Vector3(Math.random() - 0.5, Math.random(), Math.random() - 0.5));

        pe4.positions.push(new Vector3(pe4.position.x, pe4.position.y, pe4.position.z));
        sc = Math.random() * 0.5;
        pe4.scales.push(new Vector3(sc, sc, sc));
        pe4.orientations.push(new Quaternion());
        pe4.durrations.push(1);
        pe4.velocities.push(new Vector3(Math.random() - 0.5, Math.random(), Math.random() - 0.5));
    }

    pe3.updateFunction = function(p, deltaTime){
        for(let i = 0; i < p.positions.length; i++){
            p.positions[i].add(Vector3.scale(p.velocities[i], deltaTime * 10));
            p.velocities[i].y -= deltaTime * 3;
            p.durrations[i] -= deltaTime;
            if(p.durrations[i] <= 0){
                if(p.repeat){
                    p.positions[i].x = p.position.x;
                    p.positions[i].y = p.position.y;
                    p.positions[i].z = p.position.z;
                    p.durrations[i] = 1;
                    p.velocities[i] = new Vector3(Math.random() - 0.5, Math.random(), Math.random() - 0.5);
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

    pe4.updateFunction = pe3.updateFunction;
    //particleEmitters.push(pe);
    //particleEmitters.push(pe2);
    particleEmitters.push(pe3);
    particleEmitters.push(pe4);

    ///////////////////////////////////////////PARTICLES///////////////////////////////////////////////////

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
    renderParticles(particleEmitters, gameCamera, deltaTime);
    
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

var an = true;
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
                particleEmitters = [];
                particleEmitters.push(pe3);
                particleEmitters.push(pe4);
            }else{
                animatedMeshes[0].currentAnimation = animatedMeshes[0].animations["raisedaroof"];
                particleEmitters = [];
                particleEmitters.push(pe);
                particleEmitters.push(pe2);
            }
            
            break;
        }
    }
}