import { spawn } from 'child_process';

const proc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9505',
  '--remote-allow-origins=*',
  '--window-size=1280,720',
  '--disable-gpu',
  'http://localhost:5173'
]);

await new Promise((r) => setTimeout(r, 2000));
try {
  const res = await fetch('http://127.0.0.1:9505/json/list');
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

  // Let's scroll to Doom's scene (progress 0.35)
  await runCode(`
    (() => {
      const intro = document.getElementById('cinematic-intro');
      if (intro) {
        const total = intro.offsetHeight - window.innerHeight;
        window.scrollTo(0, total * 0.35);
      }
    })()
  `);
  await new Promise((r) => setTimeout(r, 1000));

  const doomState = await runCode(`
    (() => {
      return {
        scrollY: window.scrollY,
        introH: document.getElementById('cinematic-intro')?.offsetHeight
      };
    })()
  `);
  console.log('Scroll State at 0.35:', doomState);

  ws.close();
} finally {
  proc.kill();
}
