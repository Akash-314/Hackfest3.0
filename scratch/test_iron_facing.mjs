import { spawn } from 'child_process';
import fs from 'fs';

const proc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9575',
  '--remote-allow-origins=*',
  '--window-size=1280,720',
  '--disable-gpu',
  'http://localhost:5173'
]);

await new Promise((r) => setTimeout(r, 2000));
try {
  const res = await fetch('http://127.0.0.1:9575/json/list');
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

  // Wait for models
  for (let i = 0; i < 30; i++) {
    const readyRes = await sendCmd('Runtime.evaluate', {
      expression: 'Boolean(window.__CINEMATIC_DEBUG__?.hero?.isLoaded)',
      returnByValue: true
    });
    if (readyRes?.result?.value === true) break;
    await new Promise((r) => setTimeout(r, 1000));
  }

  // Set scroll to Scene 5 (progress 0.66)
  await sendCmd('Runtime.evaluate', {
    expression: `
      (() => {
        document.documentElement.style.scrollBehavior = 'auto';
        const intro = document.getElementById('cinematic-intro');
        const rect = intro.getBoundingClientRect();
        const offsetTop = rect.top + window.scrollY;
        const maxScroll = intro.offsetHeight - window.innerHeight;
        window.scrollTo({ top: offsetTop + maxScroll * 0.66, behavior: 'instant' });
      })()
    `
  });
  await new Promise((r) => setTimeout(r, 1500));

  // Try facing front with scale 0.0022 and rotation (-PI/2, 0, PI)
  await sendCmd('Runtime.evaluate', {
    expression: `
      (() => {
        const dbg = window.__CINEMATIC_DEBUG__;
        const hero = dbg.hero;
        const s = 0.0022;
        hero.model.scale.set(s, s, s);
        hero.model.rotation.set(-Math.PI / 2, 0, Math.PI);
        hero.model.position.set(0, 0, 0);
      })()
    `
  });
  await new Promise((r) => setTimeout(r, 400));
  const shot1 = await sendCmd('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/iron_facing_front.png', Buffer.from(shot1.data, 'base64'));
  console.log('Saved: scratch/iron_facing_front.png');

  // Try facing front with rotation (-PI/2, 0, 0)
  await sendCmd('Runtime.evaluate', {
    expression: `
      (() => {
        const dbg = window.__CINEMATIC_DEBUG__;
        const hero = dbg.hero;
        const s = 0.0022;
        hero.model.scale.set(s, s, s);
        hero.model.rotation.set(-Math.PI / 2, 0, 0);
        hero.model.position.set(0, 0, 0);
      })()
    `
  });
  await new Promise((r) => setTimeout(r, 400));
  const shot2 = await sendCmd('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/iron_facing_back.png', Buffer.from(shot2.data, 'base64'));
  console.log('Saved: scratch/iron_facing_back.png');

  ws.close();
} finally {
  proc.kill();
}
