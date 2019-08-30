import bpy

fileText = "var skyboxImageData = ["

nx = bpy.data.images['nx.png']
pz = bpy.data.images['nz.png']
px = bpy.data.images['px.png']
nz = bpy.data.images['pz.png']
py = bpy.data.images['py.png']
ny = bpy.data.images['ny.png']

pix = []
for p in nx.pixels:
    pix.append(int(p * 255))
fileText += str(pix) + ",";
pix = []
for p in pz.pixels:
    pix.append(int(p * 255))
fileText += str(pix) + ",";
pix = []
for p in px.pixels:
    pix.append(int(p * 255))
fileText += str(pix) + ",";
pix = []
for p in nz.pixels:
    pix.append(int(p * 255))
fileText += str(pix) + ",";
pix = []
for p in py.pixels:
    pix.append(int(p * 255))
fileText += str(pix) + ",";
pix = []
for p in ny.pixels:
    pix.append(int(p * 255))
fileText += str(pix) + ",";



fileText += "];"

file = open('/Users/dave/Desktop/skyboxImgData.js', 'w');
file.write(fileText);
file.close();