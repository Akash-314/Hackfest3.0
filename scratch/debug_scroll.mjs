import { spawn } from 'child_process';
import http from 'http';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9236;

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  const edge = spawn(EDGE_PATH, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--no-sandbox',
    '--disable-gpu',
    'http://localhost:5173/',
  ]);

  let targets = null;
  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 300));
    try {
      targets = await fetchJson(`http://127.0.0.1:${PORT}/json`);
      if (targets && targets.some((t) => t.type === 'page')) break;
    } catch {}
  }

  const page = targets?.find((t) => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);

  let idCounter = 1;
  const pending = new Map();
  function send(method, params = {}) {
    return new Promise((resolve) => {
      const id = idCounter++;
      pending.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const resolve = pending.get(msg.id);
      pending.delete(msg.id);
      resolve(msg.result);
    }
  };

  await new Promise((r) => (ws.onopen = r));
  await send('Runtime.enable');
  await send('Page.enable');
  await new Promise((r) => setTimeout(r, 1500));

  const debug = await send('Runtime.evaluate', {
    expression: `(() => {
      const sw = document.querySelector('.site-wrapper');
      return Array.from(sw.children).map(c => ({
        tag: c.tagName,
        className: c.className,
        offsetHeight: c.offsetHeight,
        position: window.getComputedStyle(c).position
      }));
    })()`,
    returnByValue: true
  });

  console.log('SITE WRAPPER CHILDREN:', JSON.stringify(debug.result.value, null, 2));
  ws.close();
  edge.kill();
}

run();
