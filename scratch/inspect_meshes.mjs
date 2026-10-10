import { spawn } from 'child_process';

const proc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9513',
  '--remote-allow-origins=*',
  '--window-size=1280,720',
  '--disable-gpu',
  'http://localhost:5173'
]);

await new Promise((r) => setTimeout(r, 2000));
try {
  const res = await fetch('http://127.0.0.1:9513/json/list');
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

  const spideyDetails = await runCode(`
    (() => {
      const dbg = window.__CINEMATIC_DEBUG__;
      if (!dbg || !dbg.spiderMan || !dbg.spiderMan.model) return 'no spidey';
      const m = dbg.spiderMan.model;
      
      const meshList = [];
      m.traverse(c => {
        if (c.isMesh) {
          c.geometry.computeBoundingBox();
          const gb = c.geometry.boundingBox;
          meshList.push({
            name: c.name,
            visible: c.visible,
            geoType: c.geometry.type,
            geoBounds: {
              min: [gb.min.x, gb.min.y, gb.min.z],
              max: [gb.max.x, gb.max.y, gb.max.z]
            },
            pos: [c.position.x, c.position.y, c.position.z],
            scale: [c.scale.x, c.scale.y, c.scale.z]
          });
        }
      });
      return {
        modelScale: [m.scale.x, m.scale.y, m.scale.z],
        modelPos: [m.position.x, m.position.y, m.position.z],
        meshList
      };
    })()
  `);
  console.log('Spidey meshes:', JSON.stringify(spideyDetails, null, 2));

  const ironDetails = await runCode(`
    (() => {
      const dbg = window.__CINEMATIC_DEBUG__;
      if (!dbg || !dbg.hero || !dbg.hero.model) return 'no iron';
      const m = dbg.hero.model;
      
      const meshList = [];
      m.traverse(c => {
        if (c.isMesh) {
          c.geometry.computeBoundingBox();
          const gb = c.geometry.boundingBox;
          meshList.push({
            name: c.name,
            visible: c.visible,
            geoBounds: {
              min: [gb.min.x, gb.min.y, gb.min.z],
              max: [gb.max.x, gb.max.y, gb.max.z]
            },
            pos: [c.position.x, c.position.y, c.position.z]
          });
        }
      });
      return {
        modelScale: [m.scale.x, m.scale.y, m.scale.z],
        modelPos: [m.position.x, m.position.y, m.position.z],
        meshList
      };
    })()
  `);
  console.log('Iron Man meshes:', JSON.stringify(ironDetails, null, 2));

  ws.close();
} finally {
  proc.kill();
}
