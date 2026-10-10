import { spawn } from 'child_process';

const proc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9543',
  '--remote-allow-origins=*',
  '--window-size=1280,720',
  '--disable-gpu',
  'http://localhost:5173'
]);

await new Promise((r) => setTimeout(r, 2000));
try {
  const res = await fetch('http://127.0.0.1:9543/json/list');
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

  const scrollInfo = await runCode(`
    (() => {
      const intro = document.getElementById('cinematic-intro');
      const h = intro?.offsetHeight;
      const maxScroll = h - window.innerHeight;
      window.scrollTo({ top: maxScroll * 0.36, behavior: 'instant' });
      return {
        introH: h,
        winH: window.innerHeight,
        scrollY: window.scrollY,
        maxScroll,
        docH: document.documentElement.scrollHeight
      };
    })()
  `);
  console.log('Scroll info:', scrollInfo);

  // Wait 1 sec and check scrollY again
  await new Promise((r) => setTimeout(r, 1000));
  const scrollInfo2 = await runCode(`
    (() => {
      const intro = document.getElementById('cinematic-intro');
      const rect = intro.getBoundingClientRect();
      const maxScroll = intro.offsetHeight - window.innerHeight;
      return {
        scrollY: window.scrollY,
        rectTop: rect.top,
        computedProgress: (-rect.top) / maxScroll
      };
    })()
  `);
  console.log('After 1s:', scrollInfo2);

  ws.close();
} finally {
  proc.kill();
}
