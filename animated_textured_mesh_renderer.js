class AnimatedTexturedMesh{
    constructor(){
        this.position = new Vector3();
        this.scale = new Vector3(1, 1, 1);
        this.orientation = new Quaternion();
        this.totalIndices = 0;
        this.indexOffset = 0;
        this.textureID = 0;
    }
}

var atmShader;
var atmVao;
var atmVbo;
var atmIbo;

var atmPositionID;
var atmNormalID;
var atmUvID;

var atmCameraViewMatrixID;
var atmModelViewMatrixID;
var atmLightPositionID;

var atmIndexBufferSize;
var atmVertexBufferSize;

var atmDefaultTexture = 0;

function initAnimatedTexturedMeshRenderer(){
    let atmVertShader = "#version 300 es\n\
in vec3 position;\n\
in vec3 normal;\n\
in vec2 uvCoordinate;\n\
uniform mat4 cameraViewMatrix;\n\
uniform mat4 modelMatrix;\n\
out vec3 fragPos;\n\
out vec3 norm;\n\
out vec2 uv;\n\
void main(){\
    fragPos = vec3(modelMatrix * vec4(position, 1.0));\
    norm = vec3(modelMatrix * vec4(normal, 0.0));\
    uv = uvCoordinate;\
    gl_Position = cameraViewMatrix * vec4(fragPos, 1.0);\
}";

let atmFragShader = "#version 300 es\n\
precision mediump float;\n\
in vec2 uv;\n\
in vec3 norm;\n\
in vec3 fragPos;\n\
uniform vec3 lightPosition;\n\
uniform sampler2D tex;\n\
out vec4 finalColor;\n\
void main(){\
    float ambient = 0.2;\
    vec3 lightDir = normalize(lightPosition - fragPos);\
    float diff = max(dot(norm, lightDir), ambient);\
    vec4 texCol = texture(tex, uv);\
    vec4 finCol = texCol * vec4(diff, diff, diff, 1);\
    finalColor = finCol;\
}";

    atmShader = compileGLShader(gl, atmVertShader, atmFragShader);
    gl.useProgram(atmShader);

    atmPositionID = gl.getAttribLocation(atmShader, "position");
    atmNormalID = gl.getAttribLocation(atmShader, "normal");
    atmUvID = gl.getAttribLocation(atmShader, "uvCoordinate");

    atmCameraViewMatrixID = gl.getUniformLocation(atmShader, "cameraViewMatrix");
    atmModelViewMatrixID = gl.getUniformLocation(atmShader, "modelMatrix");
    atmLightPositionID = gl.getUniformLocation(atmShader, "lightPosition");

    atmVao = gl.createVertexArray();
    gl.bindVertexArray(atmVao);

    atmVertexBufferSize = 0;
    atmIndexBufferSize = 0;

    atmVbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, atmVbo);
    gl.bufferData(gl.ARRAY_BUFFER, 0, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(atmPositionID);
    gl.enableVertexAttribArray(atmNormalID);
    gl.enableVertexAttribArray(atmUvID);
    gl.vertexAttribPointer(atmPositionID, 3, gl.FLOAT, gl.FALSE, 32, 0);
    gl.vertexAttribPointer(atmNormalID, 3, gl.FLOAT, gl.FALSE, 32, 12);
    gl.vertexAttribPointer(atmUvID, 2, gl.FLOAT, gl.FALSE, 32, 24);
    
    atmIbo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, atmIbo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, 0, gl.STATIC_DRAW);

    let pix = [
        100, 100, 100, 255, 200, 200, 200, 255,
        200, 200, 200, 255, 100, 100, 100, 255
    ];

    atmDefaultTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, atmDefaultTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 2, 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(pix));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
}

function renderAnimatedTexturedMeshes(meshes, camera, lightPosition){
    gl.useProgram(atmShader);
    gl.bindVertexArray(atmVao);
    gl.uniform3fv(atmLightPositionID, lightPosition.toArray());
    for(let i = 0; i < meshes.length; i++){
        let mesh = meshes[i];
        gl.bindTexture(gl.TEXTURE_2D, mesh.textureID);
        let modelMat = Matrix4.buildModelMatrix4(mesh.position, mesh.scale, mesh.orientation);
        gl.uniformMatrix4fv(atmModelViewMatrixID, gl.FALSE, modelMat.m);
        gl.uniformMatrix4fv(atmCameraViewMatrixID, gl.FALSE, camera.viewMatrix.m);
        gl.drawElements(gl.TRIANGLES, mesh.totalIndices, gl.UNSIGNED_INT, mesh.indexOffset);
    }
}

function createAnimatedTexturedMesh(vertices, indices, textureId = atmDefaultTexture){
    gl.bindVertexArray(atmVao);
    verticesSize = vertices.length * 4;
    indicesSize = indices.length * 4;
    let nvbo = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, nvbo);
    gl.bufferData(gl.ARRAY_BUFFER, atmVertexBufferSize + verticesSize, gl.STATIC_DRAW);
    gl.bindBuffer(gl.COPY_READ_BUFFER, atmVbo);
    gl.copyBufferSubData(gl.COPY_READ_BUFFER, gl.ARRAY_BUFFER, 0, 0, atmVertexBufferSize);
    gl.bufferSubData(gl.ARRAY_BUFFER, atmVertexBufferSize, new Float32Array(vertices));
    gl.deleteBuffer(atmVbo);
    atmVbo = nvbo;

    let startIndex = tmVertexBufferSize / (4 * 8);
    for(let i = 0; i < indices.length; i++){
        indices[i] += startIndex;
    }

    let nibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, nibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indicesSize + tmIndexBufferSize, gl.STATIC_DRAW);
    gl.bindBuffer(gl.COPY_READ_BUFFER, atmIbo);
    gl.copyBufferSubData(gl.COPY_READ_BUFFER, gl.ELEMENT_ARRAY_BUFFER, 0, 0, atmIndexBufferSize);
    gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, atmIndexBufferSize, new Uint32Array(indices));
    gl.deleteBuffer(atmIbo);
    atmIbo = nibo;

    gl.enableVertexAttribArray(atmPositionID);
    gl.enableVertexAttribArray(atmNormalID);
    gl.enableVertexAttribArray(atmUvID);
    gl.vertexAttribPointer(atmPositionID, 3, gl.FLOAT, gl.FALSE, 32, 0);
    gl.vertexAttribPointer(atmNormalID, 3, gl.FLOAT, gl.FALSE, 32, 12);
    gl.vertexAttribPointer(atmUvID, 2, gl.FLOAT, gl.FALSE, 32, 24);

    let tm = new TexturedMesh();
    tm.totalIndices = indices.length;
    tm.indexOffset = atmIndexBufferSize;
    tm.textureID = textureId;
    atmVertexBufferSize += verticesSize;
    atmIndexBufferSize += indicesSize;
    
    return tm;
}