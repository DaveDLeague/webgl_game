import bpy
from os import system, name

vertexList = []
indexList = []
obj = bpy.context.active_object
polys = obj.data.polygons
vertices = obj.data.vertices
uvs = obj.data.uv_layers[0].data

def clear(): 
    if name == 'nt': 
        system('cls') 
    else: 
        system('clear')
clear()

def addVertex(list, vert):
    for i, tv in enumerate(list):
        if vert == tv:
            return i
    list.append(vert)
    return len(list) - 1

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

texturePixels = []
for p in bpy.data.images['rock_monster.png'].pixels:
    texturePixels.append(int(p * 255))


fileText = "var rockMonsterMeshData = ["
fileText += str(nvList) + ","
fileText += str(indexList) + "];\n"

fileText += "var rockMonsterTextureData = " + str(texturePixels) + ";"
            
file = open('C:/Users/Dave/Desktop/rockMonsterData.js', 'w')
file.write(fileText);
file.close()