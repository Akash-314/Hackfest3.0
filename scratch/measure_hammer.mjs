import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';
import fs from 'fs';

// Read hammer GLB and inspect scene graph
const loader = new GLTFLoader();
const buf = fs.readFileSync('public/models/thor/hammer.glb');
loader.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength), '', (gltf) => {
  const box = new THREE.Box3().setFromObject(gltf.scene);
  const size = new THREE.Vector3();
  box.getSize(size);
  const center = new THREE.Vector3();
  box.getCenter(center);
  console.log('Hammer Loaded Successfully!');
  console.log('Bounding Box Min:', box.min);
  console.log('Bounding Box Max:', box.max);
  console.log('Size:', size);
  console.log('Center:', center);
  gltf.scene.traverse(c => {
    if (c.isMesh) {
      console.log('Mesh:', c.name, 'Geometry vertices:', c.geometry?.attributes?.position?.count);
    }
  });
}, (err) => {
  console.error('Error parsing GLB:', err);
});
