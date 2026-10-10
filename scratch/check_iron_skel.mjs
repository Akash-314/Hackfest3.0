import { spawn } from 'child_process';

const proc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9553',
  '--remote-allow-origins=*',
  '--window-size=1280,720',
  '--disable-gpu',
  'http://localhost:5173'
]);

await new Promise((r) => setTimeout(r, 2000));
try {
  const res = await fetch('http://127.0.0.1:9553/json/list');
  const targets = await res.json();
  const pageTarget = targets.find((t) => t.url.includes('5173')) || targets[0];
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
  await new Promise((r) => setTimeout(r, 4000));

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

  const skelData = await runCode(`
    (() => {
      const dbg = window.__CINEMATIC_DEBUG__;
      const hero = dbg.hero;
      hero.update(0.66, 10);
      dbg.renderer.render(dbg.scene, dbg.camera);
      const obj474 = hero.model.getObjectByName('Object_474');
      const skel = obj474?.skeleton;
      if (!skel) return 'no skeleton';
      const bones = skel.bones.slice(0, 10).map(b => {
        const wp = new dbg.camera.position.constructor();
        b.getWorldPosition(wp);
        return { name: b.name, wp: [+wp.x.toFixed(2), +wp.y.toFixed(2), +wp.z.toFixed(2)] };
      });
      return { boneCount: skel.bones.length, bones };
    })()
  `);
  console.log('Skeleton:', JSON.stringify(skelData, null, 2));

  ws.close();
} finally {
  proc.kill();
}
