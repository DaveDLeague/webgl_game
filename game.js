var canvas;
var gl;

var buttonDiv;
var codeDiv;

var gameCamera;

window.onload = function(){
    buttonDiv = document.getElementById('buttonDivID');
    codeDiv = document.getElementById('codeDivID');
    canvas = document.getElementById('canvasID');

    window.addEventListener('resize', windowResize);

    buttonDiv.style.position = 'absolute';
    buttonDiv.style.border = 'solid';
    codeDiv.style.position = 'absolute';
    codeDiv.style.border = 'solid';
    canvas.style.position = 'absolute';
    canvas.style.border = 'solid';

    windowResize();

    gl = canvas.getContext('webgl2');
    gl.clearColor(0, 1, 1, 1);    

    gameCamera = new Camera();
    gameCamera.setPerspectiveProjection(70.0, canvas.width / canvas.height, 0.001, 1000.0);
    gameCamera.position.z = 5;
    gameCamera.updateView();

    let verts = [
        -0.5, -0.5, 0.0, 0.0, 0.0, -1.0, 0.0, 1.0,
        -0.5,  0.5, 0.0, 0.0, 0.0, -1.0, 0.0, 0.0,
         0.5,  0.5, 0.0, 0.0, 0.0, -1.0, 1.0, 0.0,
    ];

    let inds = [
        0, 1, 2,
    ];

    gl.clear(gl.COLOR_BUFFER_BIT);
    initTexturedMeshRenderer();
    
    let msh = createTexturedMesh(verts, inds);
    prepareTexturedMeshRenderer();
    renderTexturedMesh(msh, gameCamera);
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