import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';
import fs from 'fs';

// Node test for hammer.glb using Three.js in node or inspecting bounding box
const buf = fs.readFileSync('public/models/thor/hammer.glb');
console.log('Hammer GLB file size:', buf.length);
