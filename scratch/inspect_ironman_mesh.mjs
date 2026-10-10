import { spawn } from 'child_process';

const proc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9550',
  '--remote-allow-origins=*',
  '--window-size=1280,720',
  '--disable-gpu',
  'http://localhost:5173'
]);

await new Promise((r) => setTimeout(r, 2000));
try {
  const res = await fetch('http://127.0.0.1:9550/json/list');
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

  const ironInspect = await runCode(`
    (() => {
      const dbg = window.__CINEMATIC_DEBUG__;
      const hero = dbg.hero;
      hero.update(0.66, 10);
      dbg.renderer.render(dbg.scene, dbg.camera);

      const m = hero.model;
      const results = [];
      m.traverse(c => {
        if (c.isMesh) {
          const wp = new dbg.camera.position.constructor();
          c.getWorldPosition(wp);
          const mat = c.material;
          results.push({
            name: c.name,
            visible: c.visible,
            isSkinned: Boolean(c.isSkinnedMesh),
            worldPos: [+wp.x.toFixed(2), +wp.y.toFixed(2), +wp.z.toFixed(2)],
            opacity: mat ? mat.opacity : null,
            transparent: mat ? mat.transparent : null,
            color: mat && mat.color ? mat.color.getHexString() : null,
            metalness: mat ? mat.metalness : null,
            roughness: mat ? mat.roughness : null,
          });
        }
      });
      return {
        rootPos: [hero.root.position.x, hero.root.position.y, hero.root.position.z],
        rootVisible: hero.root.visible,
        meshes: results
      };
    })()
  `);
  console.log('Iron Man Mesh World Info:', JSON.stringify(ironInspect, null, 2));

  ws.close();
} finally {
  proc.kill();
}
