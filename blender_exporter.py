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
            return i;
    list.append(vert)
    return len(list) - 1

for p in polys:
    indCt = len(indexList)
    for i, v in enumerate(p.vertices):
        pos = []
        norm = []
        uv = []
        
        pos.append(round(vertices[v].co.x, 4))
        pos.append(round(vertices[v].co.y, 4))
        pos.append(round(vertices[v].co.z, 4))
        
        norm.append(round(vertices[v].normal.x, 4))
        norm.append(round(vertices[v].normal.y, 4))
        norm.append(round(vertices[v].normal.z, 4))
        
        uv.append(round(uvs[p.loop_indices[i]].uv.x, 4))
        uv.append(round(uvs[p.loop_indices[i]].uv.y, 4))
        
        print("p:" + str(pos))
        print("u:" + str(uv))
        
        vertex = [pos, norm, uv]
        
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
    for u in v[2]:
        nvList.append(u)

texturePixels = []
for p in bpy.data.images['monkey.png'].pixels:
    texturePixels.append(int(p * 255))


fileText = "var monkeyMeshData = ["
fileText += str(nvList) + ","
fileText += str(indexList) + "];\n"

fileText += "var monkeyTextureData = " + str(texturePixels) + ";"
            
file = open('C:/Users/Dave/Desktop/monkeyData.js', 'w')
file.write(fileText);
file.close()


'''bl_info = {
    "name": "Mesh Exporter",
    "category": "Object",
}'''

'''class MeshExporter(bpy.types.Operator):
    bl_idname = "object.mesh_exporter"
    bl_label = "Mesh Exporter"
    bl_options = {'REGISTER', 'UNDO'}
    
    total: bpy.props.IntProperty(name="Steps", default=2, min=1, max=100)
    
    def execute(self, context):
        obj = bpy.context.active_object
        polys = obj.data.polygons
        vertices = obj.data.vertices
        uvs = obj.data.uv_layers[0].data
        
        for p in polys:
            for v in p.vertices:
                pos = vertices[v].co
                norm = vertices[v].normal
            
    
        return {'FINISHED'}


def menu_func(self, context):
    self.layout.operator(MeshExporter.bl_idname)

# store keymaps here to access after registration
addon_keymaps = []


def register():
    bpy.utils.register_class(MeshExporter)
    bpy.types.VIEW3D_MT_object.append(menu_func)

    # handle the keymap
    wm = bpy.context.window_manager
    # Note that in background mode (no GUI available), keyconfigs are not available either,
    # so we have to check this to avoid nasty errors in background case.
    kc = wm.keyconfigs.addon
    if kc:
        km = wm.keyconfigs.addon.keymaps.new(name='Object Mode', space_type='EMPTY')
        kmi = km.keymap_items.new(MeshExporter.bl_idname, 'T', 'PRESS', ctrl=True, shift=True)
        kmi.properties.total = 4
        addon_keymaps.append((km, kmi))

def unregister():
    # Note: when unregistering, it's usually good practice to do it in reverse order you registered.
    # Can avoid strange issues like keymap still referring to operators already unregistered...
    # handle the keymap
    for km, kmi in addon_keymaps:
        km.keymap_items.remove(kmi)
    addon_keymaps.clear()

    bpy.utils.unregister_class(MeshExporter)
    bpy.types.VIEW3D_MT_object.remove(menu_func)


if __name__ == "__main__":
    register()'''