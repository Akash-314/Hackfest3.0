import { spawn } from 'child_process';
import fs from 'fs';

const proc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9560',
  '--remote-allow-origins=*',
  '--window-size=1280,720',
  '--disable-gpu',
  'http://localhost:5173'
]);

await new Promise((r) => setTimeout(r, 2000));
try {
  const res = await fetch('http://127.0.0.1:9560/json/list');
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

  // Poll until all models are loaded and intro is ready
  console.log('Waiting for all models to load...');
  for (let i = 0; i < 30; i++) {
    const readyRes = await sendCmd('Runtime.evaluate', {
      expression: `
        (() => {
          const dbg = window.__CINEMATIC_DEBUG__;
          if (!dbg) return false;
          return Boolean(
            dbg.villain?.isLoaded &&
            dbg.hero?.isLoaded &&
            dbg.spiderMan?.isLoaded &&
            dbg.cosmicPlanet?.isLoaded
          );
        })()
      `,
      returnByValue: true
    });
    if (readyRes?.result?.value === true) {
      console.log('All models 100% loaded and ready in memory!');
      break;
    }
    await new Promise((r) => setTimeout(r, 1000));
  }

  // Dismiss any loading screen and set instant scroll
  await sendCmd('Runtime.evaluate', {
    expression: `
      (() => {
        document.documentElement.style.scrollBehavior = 'auto';
        // If loading screen button exists, click it
        const enterBtn = document.querySelector('button');
        if (enterBtn && enterBtn.textContent.includes('ENTER')) enterBtn.click();
      })()
    `
  });
  await new Promise((r) => setTimeout(r, 1500));

  const capture = async (name, progress) => {
    const scrollRes = await sendCmd('Runtime.evaluate', {
      expression: `
        (() => {
          document.documentElement.style.scrollBehavior = 'auto';
          const intro = document.getElementById('cinematic-intro');
          if (!intro) return null;
          const rect = intro.getBoundingClientRect();
          const offsetTop = rect.top + window.scrollY;
          const maxScroll = intro.offsetHeight - window.innerHeight;
          const targetY = offsetTop + maxScroll * ${progress};
          window.scrollTo({ top: targetY, behavior: 'instant' });
          return {
            name: '${name}',
            targetProgress: ${progress},
            actualProgress: (-(intro.getBoundingClientRect().top)) / maxScroll
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Navigated to:', scrollRes?.result?.value);

    // Wait for frame rendering & progress lerp
    await new Promise((r) => setTimeout(r, 1500));

    const shot = await sendCmd('Page.captureScreenshot', { format: 'png' });
    if (shot && shot.data) {
      fs.writeFileSync(`scratch/final_${name}.png`, Buffer.from(shot.data, 'base64'));
      console.log(`Saved screenshot: scratch/final_${name}.png`);
    }
  };

  await capture('scene2_planet', 0.20);
  await capture('scene3_doom', 0.36);
  await capture('scene4_surge', 0.52);
  await capture('scene5_ironman', 0.66);
  await capture('scene6_spiderman', 0.81);
  await capture('scene7_assembly', 0.94);

  ws.close();
} finally {
  proc.kill();
}
