import { spawn } from 'child_process';

const proc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9517',
  '--remote-allow-origins=*',
  '--window-size=1280,720',
  '--disable-gpu',
  'http://localhost:5173'
]);

await new Promise((r) => setTimeout(r, 2000));
try {
  const res = await fetch('http://127.0.0.1:9517/json/list');
  const targets = await res.json();
  const pageTarget = targets.find((t) => t.url.includes('5173')) || targets[0];
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
  await new Promise((r) => setTimeout(r, 5000));

  const runCode = (code) =>
    new Promise((resolve) => {
      const id = Math.floor(Math.random() * 100000);
      const handler = (e) => {
        const d = JSON.parse(e.data);
        if (d.id === id) {
          ws.removeEventListener('message', handler);
          resolve(d.result?.result?.value);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method: 'Runtime.evaluate', params: { expression: code, returnByValue: true } }));
    });

  const spideyRealBounds = await runCode(`
    (() => {
      const dbg = window.__CINEMATIC_DEBUG__;
      const m = dbg.spiderMan.model;
      if (!m) return 'no model';

      // Let's reset m.position to 0,0,0 and scale to 1,1,1
      m.position.set(0, 0, 0);
      m.scale.set(1, 1, 1);
      m.rotation.set(0, 0, 0);

      // Now update mixer for 1 second of 'Spidey' animation to pose the skeleton
      if (dbg.spiderMan.mixer) {
        dbg.spiderMan.mixer.update(0.5);
      }
      dbg.renderer.render(dbg.scene, dbg.camera);

      // Now let's calculate the bounding box of the actual skinned meshes using Three.js Box3:
      // In Three.js, for a SkinnedMesh, box3.setFromObject computes from bones if it has skeleton!
      // Let's inspect the Box3 of each SkinnedMesh
      const THREE = dbg.scene.children[0].constructor;
      // Find Box3
      let box3 = null;
      // We can create Box3 from dbg.camera or frustum or dummy
      const dMesh = new THREE.Mesh();
      // create a Box3 using dMesh or standard THREE
      return {
        hasModel: true
      };
    })()
  `);
  console.log('Result:', spideyRealBounds);

  ws.close();
} finally {
  proc.kill();
}
