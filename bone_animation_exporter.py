import bpy
from os import system, name

def clear(): 
    if name == 'nt': 
        system('cls') 
    else: 
        system('clear') 
clear()

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
animation = exportBoneAnimationData(pose, scene, keyframes)
print(animation)