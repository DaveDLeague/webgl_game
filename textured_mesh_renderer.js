const tmVertShader = "#version 300 es\n\
in vec3 position;\n\
in vec3 normal;\n\
in vec2 uvCoordinate;\n\
uniform mat4 cameraViewMatrix;\n\
uniform mat4 modelMatrix;\n\
out vec3 norm;\n\
out vec2 uv;\n\
void main(){\
    norm = normal;\
    uv = uvCoordinate;\
    gl_Position = cameraViewMatrix * modelMatrix * vec4(position, 1.0);\
}\
";

const tmFragShader =  "#version 300 es\n\
precision mediump float;\n\
in vec2 uv;\n\
in vec3 norm;\n\
uniform sampler2D tex;\n\
out vec4 finalColor;\n\
void main(){\
    vec4 texCol = texture(tex, uv);\
    finalColor = texCol;\
}\
";

class TexturedMesh{
    constructor(){
        this.position = new Vector3();
        this.scale = new Vector3(1, 1, 1);
        this.orientation = new Quaternion();
        this.totalIndices = 0;
        this.indexOffset = 0;
        this.textureID = 0;
    }
}

var tmShader;
var tmVao;
var tmVbo;
var tmIbo;

var tmPositionID;
var tmNormalID;
var tmUvID;

var tmCameraViewMatrixID;
var tmModelViewMatrixID;

var tmIndexBufferSize;
var tmVertexBufferSize;

var tmDefaultTexture = 0;

function initTexturedMeshRenderer(){
    tmShader = compileGLShader(gl, tmVertShader, tmFragShader);
    gl.useProgram(tmShader);

    tmPositionID = gl.getAttribLocation(tmShader, "position");
    tmNormalID = gl.getAttribLocation(tmShader, "normal");
    tmUvID = gl.getAttribLocation(tmShader, "uvCoordinate");

    tmCameraViewMatrixID = gl.getUniformLocation(tmShader, "cameraViewMatrix");
    tmModelViewMatrixID = gl.getUniformLocation(tmShader, "modelMatrix");

    tmVao = gl.createVertexArray();
    gl.bindVertexArray(tmVao);

    tmVertexBufferSize = 0;
    tmIndexBufferSize = 0;

    tmVbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tmVbo);
    gl.bufferData(gl.ARRAY_BUFFER, 0, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(tmPositionID);
    gl.enableVertexAttribArray(tmNormalID);
    gl.enableVertexAttribArray(tmUvID);
    gl.vertexAttribPointer(tmPositionID, 3, gl.FLOAT, gl.FALSE, 32, 0);
    gl.vertexAttribPointer(tmNormalID, 3, gl.FLOAT, gl.FALSE, 32, 12);
    gl.vertexAttribPointer(tmUvID, 2, gl.FLOAT, gl.FALSE, 32, 24);
    
    tmIbo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, tmIbo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, 0, gl.STATIC_DRAW);

    let pix = [
        100, 100, 100, 255, 200, 200, 200, 255,
        200, 200, 200, 255, 100, 100, 100, 255
    ];
    tmDefaultTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tmDefaultTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 2, 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(pix));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
}

function renderTexturedMeshes(meshes, camera){
    gl.useProgram(tmShader);
    gl.bindVertexArray(tmVao);
    for(let i = 0; i < meshes.length; i++){
        let mesh = meshes[i];
        gl.bindTexture(gl.TEXTURE_2D, mesh.textureID);
        let modelMat = Matrix4.buildModelMatrix4(mesh.position, mesh.scale, mesh.orientation);
        gl.uniformMatrix4fv(tmModelViewMatrixID, gl.FALSE, modelMat.m);
        gl.uniformMatrix4fv(tmCameraViewMatrixID, gl.FALSE, camera.viewMatrix.m);
        gl.drawElements(gl.TRIANGLES, mesh.totalIndices, gl.UNSIGNED_INT, mesh.indexOffset);
    }
    
}

function createTexturedMesh(vertices, indices, textureId = tmDefaultTexture){
    gl.bindVertexArray(tmVao);
    verticesSize = vertices.length * 4;
    indicesSize = indices.length * 4;
    let nvbo = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, nvbo);
    gl.bufferData(gl.ARRAY_BUFFER, tmVertexBufferSize + verticesSize, gl.STATIC_DRAW);
    gl.bindBuffer(gl.COPY_READ_BUFFER, tmVbo);
    gl.copyBufferSubData(gl.COPY_READ_BUFFER, gl.ARRAY_BUFFER, 0, 0, tmVertexBufferSize);
    gl.bufferSubData(gl.ARRAY_BUFFER, tmVertexBufferSize, new Float32Array(vertices));
    gl.deleteBuffer(tmVbo);
    tmVbo = nvbo;

    let startIndex = tmVertexBufferSize / (4 * 8);
    for(let i = 0; i < indices.length; i++){
        indices[i] += startIndex;
    }

    let nibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, nibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indicesSize + tmIndexBufferSize, gl.STATIC_DRAW);
    gl.bindBuffer(gl.COPY_READ_BUFFER, tmIbo);
    gl.copyBufferSubData(gl.COPY_READ_BUFFER, gl.ELEMENT_ARRAY_BUFFER, 0, 0, tmIndexBufferSize);
    gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, tmIndexBufferSize, new Uint32Array(indices));
    gl.deleteBuffer(tmIbo);
    tmIbo = nibo;

    gl.enableVertexAttribArray(tmPositionID);
    gl.enableVertexAttribArray(tmNormalID);
    gl.enableVertexAttribArray(tmUvID);
    gl.vertexAttribPointer(tmPositionID, 3, gl.FLOAT, gl.FALSE, 32, 0);
    gl.vertexAttribPointer(tmNormalID, 3, gl.FLOAT, gl.FALSE, 32, 12);
    gl.vertexAttribPointer(tmUvID, 2, gl.FLOAT, gl.FALSE, 32, 24);

    let tm = new TexturedMesh();
    tm.totalIndices = indices.length;
    tm.indexOffset = tmIndexBufferSize;
    tm.textureID = textureId;
    tmVertexBufferSize += verticesSize;
    tmIndexBufferSize += indicesSize;
    
    return tm;
}