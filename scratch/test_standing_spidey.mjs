import { spawn } from 'child_process';

const proc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9522',
  '--remote-allow-origins=*',
  '--window-size=1280,720',
  '--disable-gpu',
  'http://localhost:5173'
]);

await new Promise((r) => setTimeout(r, 2000));
try {
  const res = await fetch('http://127.0.0.1:9522/json/list');
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

  const testApplied = await runCode(`
    (() => {
      const dbg = window.__CINEMATIC_DEBUG__;
      const m = dbg.spiderMan.model;
      if (!m) return 'no model';

      // Test standing orientation:
      // In local coordinates of model:
      // rotation.z = Math.PI / 2
      // Let's also check facing direction (which way the chest faces):
      m.scale.set(1.75, 1.75, 1.75);
      m.rotation.set(0, 0, Math.PI / 2);
      // Feet were at x = -1.034, so after rot.z = Math.PI/2, feet are at y = -1.034 * 1.75 = -1.81
      // So model position y = 1.81 puts feet at y = 0:
      m.position.set(0, 1.81, 0);

      m.updateMatrixWorld(true);

      const head = m.getObjectByName('mixamorigHead_06');
      const leftFoot = m.getObjectByName('mixamorigLeftFoot_058');
      const rightFoot = m.getObjectByName('mixamorigRightFoot_062');
      const hips = m.getObjectByName('mixamorigHips_01');

      const hp = new dbg.camera.position.constructor();
      const lfp = new dbg.camera.position.constructor();
      const rfp = new dbg.camera.position.constructor();
      const hipp = new dbg.camera.position.constructor();

      head?.getWorldPosition(hp);
      leftFoot?.getWorldPosition(lfp);
      rightFoot?.getWorldPosition(rfp);
      hips?.getWorldPosition(hipp);

      return {
        head: [+hp.x.toFixed(2), +hp.y.toFixed(2), +hp.z.toFixed(2)],
        foot: [+(0.5 * (lfp.x + rfp.x)).toFixed(2), +(0.5 * (lfp.y + rfp.y)).toFixed(2), +(0.5 * (lfp.z + rfp.z)).toFixed(2)],
        hips: [+hipp.x.toFixed(2), +hipp.y.toFixed(2), +hipp.z.toFixed(2)],
      };
    })()
  `);
  console.log('Spider-Man Standing Bone Positions:', JSON.stringify(testApplied, null, 2));

  ws.close();
} finally {
  proc.kill();
}
