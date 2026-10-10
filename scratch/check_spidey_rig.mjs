import { spawn } from 'child_process';

const proc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9514',
  '--remote-allow-origins=*',
  '--window-size=1280,720',
  '--disable-gpu',
  'http://localhost:5173'
]);

await new Promise((r) => setTimeout(r, 2000));
try {
  const res = await fetch('http://127.0.0.1:9514/json/list');
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

  const spideyTest = await runCode(`
    (() => {
      const dbg = window.__CINEMATIC_DEBUG__;
      const m = dbg.spiderMan.model;
      if (!m) return 'no model';

      // Let's reset m.position to 0,0,0
      m.position.set(0, 0, 0);
      m.scale.set(1, 1, 1);
      m.rotation.set(0, 0, 0);

      // Find all SkinnedMeshes and normal meshes
      const info = [];
      m.traverse(c => {
        if (c.isMesh) {
          info.push({
            name: c.name,
            isSkinned: Boolean(c.isSkinnedMesh),
            parent: c.parent ? c.parent.name : null,
            rot: [c.rotation.x, c.rotation.y, c.rotation.z],
            pos: [c.position.x, c.position.y, c.position.z],
            scale: [c.scale.x, c.scale.y, c.scale.z]
          });
        }
      });

      // Let's also check the bones
      const bones = [];
      m.traverse(c => {
        if (c.isBone) {
          bones.push({
            name: c.name,
            pos: [c.position.x, c.position.y, c.position.z]
          });
        }
      });

      return {
        meshInfo: info,
        boneCount: bones.length,
        first5Bones: bones.slice(0, 5)
      };
    })()
  `);
  console.log('Spidey Rig Details:', JSON.stringify(spideyTest, null, 2));

  ws.close();
} finally {
  proc.kill();
}
