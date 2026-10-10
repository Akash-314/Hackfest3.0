import fs from 'fs';

function inspectGlb(filePath) {
  const buf = fs.readFileSync(filePath);
  const magic = buf.readUInt32LE(0);
  const version = buf.readUInt32LE(4);
  const length = buf.readUInt32LE(8);
  const jsonChunkLength = buf.readUInt32LE(12);
  const jsonChunkType = buf.readUInt32LE(16);
  const jsonStr = buf.toString('utf8', 20, 20 + jsonChunkLength);
  const json = JSON.parse(jsonStr);
  return {
    nodes: json.nodes?.map(n => n.name),
    meshes: json.meshes?.map(m => m.name),
    animations: json.animations?.map(a => a.name),
    materials: json.materials?.map(m => m.name),
  };
}

console.log('--- THOR GLB ---');
console.log(JSON.stringify(inspectGlb('c:/Users/AKASH/OneDrive/Desktop/Hackfest3.0/public/models/thor/thor.glb'), null, 2));

console.log('--- HAMMER GLB ---');
console.log(JSON.stringify(inspectGlb('c:/Users/AKASH/OneDrive/Desktop/Hackfest3.0/public/models/thor/hammer.glb'), null, 2));
