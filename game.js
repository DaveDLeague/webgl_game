var canvas;
var gl;

var buttonDiv;
var codeDiv;

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
    initCanvas();
}

function windowResize(){
    buttonDiv.style.top = window.innerHeight - (window.innerHeight * 0.25)
    buttonDiv.style.width = window.innerWidth * 0.98;
    buttonDiv.style.height = window.innerHeight * 0.96 * 0.25;
    codeDiv.style.width = window.innerWidth * 0.96 * 0.25;
    codeDiv.style.height = window.innerHeight * 0.96 * 0.75;
    canvas.style.left = window.innerWidth * 0.25;
    canvas.style.height = window.innerHeight * 0.96 * 0.75;
}

function initCanvas(){
    gl = canvas.getContext('webgl2');
    gl.clearColor(0, 1, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
}