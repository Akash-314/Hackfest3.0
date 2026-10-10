import { spawn } from 'child_process';

const proc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9516',
  '--remote-allow-origins=*',
  '--window-size=1280,720',
  '--disable-gpu',
  'http://localhost:5173'
]);

await new Promise((r) => setTimeout(r, 2000));
try {
  const res = await fetch('http://127.0.0.1:9516/json/list');
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

  const testResults = await runCode(`
    (() => {
      const dbg = window.__CINEMATIC_DEBUG__;
      if (!dbg) return 'no dbg';
      
      const THREE = dbg.scene.children[0].constructor;
      // Let's get the Three.js library by traversing an object's prototype or looking at Box3
      let Box3;
      // create Box3 via dbg.camera
      const cam = dbg.camera;
      
      // Let's test Spider-Man bounds when update is run
      // In Scene 6 (p=0.8):
      dbg.spiderMan.update(0.80, 10);
      
      // In Scene 5 (p=0.65):
      dbg.hero.update(0.65, 10);
      
      // In Scene 3 (p=0.35):
      dbg.villain.update(0.35, 10);

      const inspectObject = (ctrl, name) => {
        const obj = ctrl.root;
        const pivot = ctrl.characterPivot;
        const model = ctrl.model;
        
        return {
          name,
          rootVisible: obj.visible,
          rootPos: [obj.position.x, obj.position.y, obj.position.z],
          pivotPos: [pivot.position.x, pivot.position.y, pivot.position.z],
          pivotRot: [pivot.rotation.x, pivot.rotation.y, pivot.rotation.z],
          modelPos: model ? [model.position.x, model.position.y, model.position.z] : null,
          modelScale: model ? [model.scale.x, model.scale.y, model.scale.z] : null,
        };
      };

      return {
        doom: inspectObject(dbg.villain, 'Doctor Doom'),
        ironMan: inspectObject(dbg.hero, 'Iron Man'),
        spiderman: inspectObject(dbg.spiderMan, 'Spider-Man'),
      };
    })()
  `);
  console.log('Scene Positions and Transforms:', JSON.stringify(testResults, null, 2));

  ws.close();
} finally {
  proc.kill();
}
