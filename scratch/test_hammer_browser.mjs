import { spawn } from 'child_process';
import http from 'http';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9237;

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  const edge = spawn(EDGE_PATH, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--no-sandbox',
    '--disable-gpu',
    'http://localhost:5173/',
  ]);

  let targets = null;
  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 300));
    try {
      targets = await fetchJson(`http://127.0.0.1:${PORT}/json`);
      if (targets && targets.some((t) => t.type === 'page')) break;
    } catch {}
  }

  const page = targets?.find((t) => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);

  let idCounter = 1;
  const pending = new Map();
  function send(method, params = {}) {
    return new Promise((resolve) => {
      const id = idCounter++;
      pending.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const resolve = pending.get(msg.id);
      pending.delete(msg.id);
      resolve(msg.result);
    }
  };

  await new Promise((r) => (ws.onopen = r));
  await send('Runtime.enable');
  await send('Page.enable');
  await new Promise((r) => setTimeout(r, 1500));

  // Load hammer in browser WebGL context using Three.js and GLTFLoader
  const evalRes = await send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `(async () => {
      const { GLTFLoader } = await import('/node_modules/three/examples/jsm/loaders/GLTFLoader.js');
      const THREE = await import('/node_modules/three/build/three.module.js');
      const loader = new GLTFLoader();
      return new Promise((resolve) => {
        loader.load('/models/thor/hammer.glb', (gltf) => {
          const box = new THREE.Box3().setFromObject(gltf.scene);
          const size = new THREE.Vector3();
          box.getSize(size);
          const center = new THREE.Vector3();
          box.getCenter(center);
          resolve({
            success: true,
            size: [size.x, size.y, size.z],
            center: [center.x, center.y, center.z],
            meshes: gltf.scene.children.length
          });
        }, null, (err) => {
          resolve({ success: false, error: String(err) });
        });
      });
    })()`,
    returnByValue: true
  });

  console.log('BROWSER HAMMER RESULT:', evalRes.result.value);
  ws.close();
  edge.kill();
}

run();
