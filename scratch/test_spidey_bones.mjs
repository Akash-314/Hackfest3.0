import { spawn } from 'child_process';

const proc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9520',
  '--remote-allow-origins=*',
  '--window-size=1280,720',
  '--disable-gpu',
  'http://localhost:5173'
]);

await new Promise((r) => setTimeout(r, 2000));
try {
  const res = await fetch('http://127.0.0.1:9520/json/list');
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

  const testAnimationPose = await runCode(`
    (() => {
      const dbg = window.__CINEMATIC_DEBUG__;
      const m = dbg.spiderMan.model;
      if (!m) return 'no model';

      // Look at bones with animation mixer
      // Find head bone and foot bone
      const bones = {};
      m.traverse(c => {
        if (c.isBone) {
          const wp = new dbg.camera.position.constructor();
          c.getWorldPosition(wp);
          bones[c.name] = [wp.x, wp.y, wp.z];
        }
      });

      return {
        hips: bones['mixamorigHips_01'] || bones['mixamorig:Hips'] || bones['Hips'],
        head: bones['mixamorigHead_06'] || bones['mixamorig:Head'] || bones['Head'],
        leftFoot: bones['mixamorigLeftFoot_058'] || bones['mixamorig:LeftFoot'],
        rightFoot: bones['mixamorigRightFoot_062'] || bones['mixamorig:RightFoot'],
      };
    })()
  `);
  console.log('Spidey World Bone Positions:', JSON.stringify(testAnimationPose, null, 2));

  ws.close();
} finally {
  proc.kill();
}
