import { spawn } from 'child_process';

const proc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9535',
  '--remote-allow-origins=*',
  '--window-size=1280,720',
  '--disable-gpu',
  'http://localhost:5173'
]);

await new Promise((r) => setTimeout(r, 2000));
try {
  const res = await fetch('http://127.0.0.1:9535/json/list');
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

  const inspectLive = await runCode(`
    (() => {
      const dbg = window.__CINEMATIC_DEBUG__;
      if (!dbg) return 'no dbg';

      const check = (ctrl, name) => {
        if (!ctrl || !ctrl.model) return { name, error: 'no model' };
        
        let meshes = [];
        ctrl.model.traverse(c => {
          if (c.isMesh) {
            meshes.push({
              name: c.name,
              visible: c.visible,
              material: c.material ? (Array.isArray(c.material) ? c.material.map(m => m.type) : c.material.type) : 'none'
            });
          }
        });

        return {
          name,
          isLoaded: ctrl.isLoaded,
          modelPos: [ctrl.model.position.x, ctrl.model.position.y, ctrl.model.position.z],
          modelScale: [ctrl.model.scale.x, ctrl.model.scale.y, ctrl.model.scale.z],
          modelRot: [ctrl.model.rotation.x, ctrl.model.rotation.y, ctrl.model.rotation.z],
          rootPos: [ctrl.root.position.x, ctrl.root.position.y, ctrl.root.position.z],
          pivotPos: [ctrl.characterPivot.position.x, ctrl.characterPivot.position.y, ctrl.characterPivot.position.z],
          rootVisible: ctrl.root.visible,
          meshes
        };
      };

      return {
        doom: check(dbg.villain, 'Doctor Doom'),
        ironMan: check(dbg.hero, 'Iron Man'),
        spiderman: check(dbg.spiderMan, 'Spider-Man'),
      };
    })()
  `);
  console.log('LIVE INSPECTION:', JSON.stringify(inspectLive, null, 2));

  ws.close();
} finally {
  proc.kill();
}
