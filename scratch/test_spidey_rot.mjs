import { spawn } from 'child_process';

const proc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9521',
  '--remote-allow-origins=*',
  '--window-size=1280,720',
  '--disable-gpu',
  'http://localhost:5173'
]);

await new Promise((r) => setTimeout(r, 2000));
try {
  const res = await fetch('http://127.0.0.1:9521/json/list');
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

  const testRotations = await runCode(`
    (() => {
      const dbg = window.__CINEMATIC_DEBUG__;
      const m = dbg.spiderMan.model;
      if (!m) return 'no model';

      // Reset
      m.position.set(0, 0, 0);
      m.scale.set(1, 1, 1);
      m.rotation.set(0, 0, 0);

      const getBones = () => {
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
          head: [+hp.x.toFixed(3), +hp.y.toFixed(3), +hp.z.toFixed(3)],
          foot: [+(0.5 * (lfp.x + rfp.x)).toFixed(3), +(0.5 * (lfp.y + rfp.y)).toFixed(3), +(0.5 * (lfp.z + rfp.z)).toFixed(3)],
          hips: [+hipp.x.toFixed(3), +hipp.y.toFixed(3), +hipp.z.toFixed(3)],
        };
      };

      const initial = getBones();

      return { initial };
    })()
  `);
  console.log('Spider-Man Bone Positions at scale 1, pos 0:', JSON.stringify(testRotations, null, 2));

  ws.close();
} finally {
  proc.kill();
}
