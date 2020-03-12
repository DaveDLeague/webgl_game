import bpy
import math
from os import system, name

def clear(): 
    if name == 'nt': 
        system('cls') 
    else: 
        system('clear') 
clear()

def getPixelDataFromImage(image):
    texturePixels = []
    for p in image.pixels:
        texturePixels.append(int(p * 255))
    return texturePixels;

def exportAnimatedTextureMeshData(polys, vertices, uvs):
    def addVertex(list, vert):
        for i, tv in enumerate(list):
            if vert == tv:
                return i
        list.append(vert)
        return len(list) - 1
    vertexList = []
    indexList = []
    for p in polys:
        indCt = len(indexList)
        for i, v in enumerate(p.vertices):
            pos = []
            norm = []
            weights = [0, 0, 0]
            bones = [0, 0, 0]
            uv = []
            
            pos.append(round(vertices[v].co.x, 4))
            pos.append(round(vertices[v].co.y, 4))
            pos.append(round(vertices[v].co.z, 4))
            
            norm.append(round(vertices[v].normal.x, 4))
            norm.append(round(vertices[v].normal.y, 4))
            norm.append(round(vertices[v].normal.z, 4))
            
            for j, g in enumerate(vertices[v].groups):
                if(j > 2): 
                    break
                weights[j] = round(g.weight, 4)
                bones[j] = round(g.group, 4)
            print(weights[0] + weights[1] + weights[2])
                
            uv.append(round(uvs[p.loop_indices[i]].uv.x, 4))
            uv.append(round(uvs[p.loop_indices[i]].uv.y, 4))
            
            vertex = [pos, norm, weights, bones, uv]
            
            if i < 3:
                indexList.append(addVertex(vertexList, vertex))
            else:
                indexList.append(indexList[len(indexList) - 1])
                indexList.append(addVertex(vertexList, vertex))
                indexList.append(indexList[indCt])

    nvList = []
    for v in vertexList:
        for p in v[0]:
            nvList.append(p)
        for n in v[1]:
            nvList.append(n)
        for w in v[2]:
            nvList.append(w)
        for b in v[3]:
            nvList.append(b)
        for u in v[4]:
            nvList.append(u)
    return [nvList, indexList];

def exportBoneAnimationData(pose, scene, keyframes):
    def parsePose(parent, bone):
        loc = []
        rot = []
        chi = []
        if parent is not None:
            mat = parent.matrix.inverted() @ bone.matrix;
            loc.append(round(mat[0][3], 4))
            loc.append(round(mat[1][3], 4))
            loc.append(round(mat[2][3], 4))
            q = mat.to_quaternion()
            rot.append(round(q.x, 4))
            rot.append(round(q.y, 4))
            rot.append(round(q.z, 4))
            rot.append(round(q.w, 4))
        else:
            loc.append(round(bone.matrix[0][3], 4))
            loc.append(round(bone.matrix[1][3], 4))
            loc.append(round(bone.matrix[2][3], 4))
            q = bone.matrix.to_quaternion()
            rot.append(round(q.x, 4))
            rot.append(round(q.y, 4))
            rot.append(round(q.z, 4))
            rot.append(round(q.w, 4))
            
            
        if len(bone.children) > 0:
            for b in bone.children:
                chi.append(parsePose(bone, b))
        return [loc, rot, chi]
    
    def parseInvBT(arr, bone):
        mat = bone.matrix.inverted().transposed()
        m = []
        for i in range(len(mat)):
            for j in range(len(mat[i])):
                m.append(round(mat[i][j], 4))
        arr.append(m)
        for b in bone.children:
            parseInvBT(arr, b)
    animation = []
    for k in keyframes:
        scene.frame_set(k)
        animation.append(parsePose(None, pose.bones[0]))
    
    invBT = []
    scene.frame_set(0)
    parseInvBT(invBT, pose.bones[0])
    
    frameDurations = []
    for i in range(len(keyframes) - 1):
        cf = keyframes[i]
        nf = keyframes[i + 1]
        frameDurations.append(nf - cf)
    return [animation, invBT, frameDurations]

def getKeyframesInAnimation(fcurves, startFrame, endFrame):
    keyframes = []
    for fcv in fcurves:
        for k in fcv.keyframe_points:
            x = k.co.x
            if x >= startFrame and x <= endFrame:
                keyframes.append(x)
    keyframes = list(set(keyframes))
    keyframes.sort()
    return keyframes

scene = bpy.data.scenes['Scene']
scene.frame_set(0)
pose = bpy.data.objects['Armature'].pose
fcurves = bpy.data.actions['ArmatureAction'].fcurves
keyframes = getKeyframesInAnimation(fcurves, 1, 25)
animation1 = exportBoneAnimationData(pose, scene, keyframes)

polys = bpy.data.objects['boo_lean'].data.polygons
vertices = bpy.data.objects['boo_lean'].data.vertices
img = bpy.data.images['boo_lean.png']
uvs = bpy.data.objects['boo_lean'].data.uv_layers[0].data

vts = exportAnimatedTextureMeshData(polys, vertices, uvs)
pxls = getPixelDataFromImage(img)


fileText = "var boo_leanAnimation = {\"idle\":" + str(animation1) + "};\n"
fileText += "var boo_leanMeshData = " + str(vts) + ";\n"
fileText += "var boo_leanTextureData = " + str(pxls) + ";"

file = open("C:/Users/Dave/Desktop/rockMonsterData.js", "w")
file.write(fileText)
file.close()
