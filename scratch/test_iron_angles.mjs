import { spawn } from 'child_process';
import fs from 'fs';

const proc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9570',
  '--remote-allow-origins=*',
  '--window-size=1280,720',
  '--disable-gpu',
  'http://localhost:5173'
]);

await new Promise((r) => setTimeout(r, 2000));
try {
  const res = await fetch('http://127.0.0.1:9570/json/list');
  const targets = await res.json();
  const pageTarget = targets.find((t) => t.url.includes('5173')) || targets[0];
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
  ws.send(JSON.stringify({ id: 2, method: 'Page.enable' }));

  let msgId = 100;
  const sendCmd = (method, params = {}) =>
    new Promise((resolve) => {
      const id = ++msgId;
      const handler = (e) => {
        const d = JSON.parse(e.data);
        if (d.id === id) {
          ws.removeEventListener('message', handler);
          resolve(d.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });

  await new Promise((r) => setTimeout(r, 6000));

  // Stop the requestAnimationFrame loop by clearing it or setting a flag, so we can control camera
  await sendCmd('Runtime.evaluate', {
    expression: `
      (() => {
        const dbg = window.__CINEMATIC_DEBUG__;
        const hero = dbg.hero;
        // Make only hero visible
        dbg.villain.root.visible = false;
        dbg.spiderMan.root.visible = false;
        dbg.cosmicPlanet.root.visible = false;
        dbg.lightningWarrior.root.visible = false;
        hero.root.visible = true;
        hero.root.position.set(0, 0, 0);
        hero.characterPivot.position.set(0, 0, 0);
        hero.characterPivot.rotation.set(0, 0, 0);
      })()
    `
  });

  const testView = async (name, camPos, camLook) => {
    await sendCmd('Runtime.evaluate', {
      expression: `
        (() => {
          const dbg = window.__CINEMATIC_DEBUG__;
          dbg.camera.position.set(${camPos.x}, ${camPos.y}, ${camPos.z});
          dbg.camera.lookAt(${camLook.x}, ${camLook.y}, ${camLook.z});
          dbg.renderer.render(dbg.scene, dbg.camera);
        })()
      `
    });
    await new Promise((r) => setTimeout(r, 300));
    const shot = await sendCmd('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(`scratch/iron_angle_${name}.png`, Buffer.from(shot.data, 'base64'));
    console.log(`Saved: scratch/iron_angle_${name}.png`);
  };

  // 1. Looking from +Z towards origin at eye level Y = 1.6
  await testView('from_plus_Z', { x: 0, y: 1.6, z: 6 }, { x: 0, y: 1.6, z: 0 });
  // 2. Looking from -Z towards origin
  await testView('from_minus_Z', { x: 0, y: 1.6, z: -6 }, { x: 0, y: 1.6, z: 0 });
  // 3. Looking from +Y down towards origin
  await testView('from_top_plus_Y', { x: 0, y: 8, z: 0.1 }, { x: 0, y: 0, z: 0 });
  // 4. Looking from +X side towards origin
  await testView('from_side_plus_X', { x: 6, y: 1.6, z: 0 }, { x: 0, y: 1.6, z: 0 });

  ws.close();
} finally {
  proc.kill();
}
