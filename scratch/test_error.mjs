import { spawn } from 'child_process';
import http from 'http';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9231;

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

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.method === 'Runtime.exceptionThrown') {
      console.log('EXCEPTION:', JSON.stringify(msg.params.exceptionDetails, null, 2));
    } else if (msg.method === 'Runtime.consoleAPICalled') {
      if (msg.params.type === 'error') {
        console.log('CONSOLE ERROR:', msg.params.args.map((a) => a.value || a.description).join(' '));
      }
    }
  };

  await new Promise((r) => (ws.onopen = r));
  ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
  ws.send(JSON.stringify({ id: 2, method: 'Page.enable' }));

  await new Promise((r) => setTimeout(r, 4000));
  ws.close();
  edge.kill();
}

run();
