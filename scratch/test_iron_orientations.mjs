import { spawn } from 'child_process';
import fs from 'fs';

const proc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9565',
  '--remote-allow-origins=*',
  '--window-size=1280,720',
  '--disable-gpu',
  'http://localhost:5173'
]);

await new Promise((r) => setTimeout(r, 2000));
try {
  const res = await fetch('http://127.0.0.1:9565/json/list');
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

  // Test orientation A: rotX = -PI/2, rotY = PI (180 flip)
  await sendCmd('Runtime.evaluate', {
    expression: `
      (() => {
        const dbg = window.__CINEMATIC_DEBUG__;
        const hero = dbg.hero;
        hero.update(0.66, 10);
        hero.model.rotation.set(-Math.PI / 2, Math.PI, 0);
        dbg.camera.position.set(0, 1.8, 5.5);
        dbg.camera.lookAt(0, 1.8, 0);
        dbg.renderer.render(dbg.scene, dbg.camera);
      })()
    `
  });
  await new Promise((r) => setTimeout(r, 600));
  const shotA = await sendCmd('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/ironman_test_A.png', Buffer.from(shotA.data, 'base64'));

  // Test orientation B: rotX = -PI/2, rotY = 0
  await sendCmd('Runtime.evaluate', {
    expression: `
      (() => {
        const dbg = window.__CINEMATIC_DEBUG__;
        const hero = dbg.hero;
        hero.update(0.66, 10);
        hero.model.rotation.set(-Math.PI / 2, 0, 0);
        dbg.camera.position.set(0, 1.8, 5.5);
        dbg.camera.lookAt(0, 1.8, 0);
        dbg.renderer.render(dbg.scene, dbg.camera);
      })()
    `
  });
  await new Promise((r) => setTimeout(r, 600));
  const shotB = await sendCmd('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/ironman_test_B.png', Buffer.from(shotB.data, 'base64'));

  // Test orientation C: rotX = Math.PI / 2
  await sendCmd('Runtime.evaluate', {
    expression: `
      (() => {
        const dbg = window.__CINEMATIC_DEBUG__;
        const hero = dbg.hero;
        hero.update(0.66, 10);
        hero.model.rotation.set(Math.PI / 2, 0, 0);
        dbg.camera.position.set(0, 1.8, 5.5);
        dbg.camera.lookAt(0, 1.8, 0);
        dbg.renderer.render(dbg.scene, dbg.camera);
      })()
    `
  });
  await new Promise((r) => setTimeout(r, 600));
  const shotC = await sendCmd('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/ironman_test_C.png', Buffer.from(shotC.data, 'base64'));

  ws.close();
} finally {
  proc.kill();
}
