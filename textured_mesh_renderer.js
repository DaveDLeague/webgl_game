var tmShader;
var tmVao;
var tmVbo;
var tmIbo;

var tmPositionID;

const tmVertShader = "#version 300 es\n\
in vec3 position;\n\
void main(){\
gl_Position = vec4(position, 1.0);\
}\
";
const tmFragShader =  "#version 300 es\n\
precision mediump float;\n\
out vec4 finalColor;\n\
void main(){\
finalColor = vec4(1, 0, 0, 1);\
}\
";

function initTexturedMeshRenderer(){
    tmShader = compileGLShader(gl, tmVertShader, tmFragShader);
    gl.useProgram(tmShader);

    tmPositionID = gl.getAttribLocation(tmShader, "position");

    tmVao = gl.createVertexArray();
    gl.bindVertexArray(tmVao);

    let verts = [
        -0.5, -0.5, 0.0,
        -0.5,  0.5, 0.0,
         0.5,  0.5, 0.0, 
         0.5, -0.5, 0.0,
    ];

    let inds = [
        0, 1, 2, 2, 3, 0
    ];

    tmVbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tmVbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(tmPositionID);
    gl.vertexAttribPointer(tmPositionID, 3, gl.FLOAT, gl.FALSE, 0, 0);
    
    tmIbo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, tmIbo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(inds), gl.STATIC_DRAW);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_INT, 0);
}