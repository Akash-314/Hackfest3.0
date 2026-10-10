import { spawn } from 'child_process';

const proc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9512',
  '--remote-allow-origins=*',
  '--window-size=1280,720',
  '--disable-gpu',
  'http://localhost:5173'
]);

await new Promise((r) => setTimeout(r, 2000));
try {
  const res = await fetch('http://127.0.0.1:9512/json/list');
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

  const boxInfo = await runCode(`
    (() => {
      const dbg = window.__CINEMATIC_DEBUG__;
      if (!dbg) return 'no dbg';
      
      const THREE = dbg.scene.__proto__.constructor.name === 'Scene' ? window.THREE : null;
      // We can use any object's traverse to find a mesh with geometry to inspect dimensions:
      const measure = (ctrl, name) => {
        if (!ctrl || !ctrl.model) return { name, error: 'no model' };
        
        let min = { x: Infinity, y: Infinity, z: Infinity };
        let max = { x: -Infinity, y: -Infinity, z: -Infinity };
        
        ctrl.model.traverse(child => {
          if (child.isMesh && child.geometry) {
            child.geometry.computeBoundingBox();
            const gb = child.geometry.boundingBox;
            if (gb) {
              // apply child world matrix relative to ctrl.model
              child.updateWorldMatrix(true, false);
            }
          }
        });
        
        // Use Box3
        const box3Constructor = ctrl.model.parent.constructor.name ? null : null;
        return {
          name,
          isLoaded: ctrl.isLoaded,
          scale: { x: ctrl.model.scale.x, y: ctrl.model.scale.y, z: ctrl.model.scale.z },
          pos: { x: ctrl.model.position.x, y: ctrl.model.position.y, z: ctrl.model.position.z },
          pivotPos: { x: ctrl.characterPivot.position.x, y: ctrl.characterPivot.position.y, z: ctrl.characterPivot.position.z },
          rootPos: { x: ctrl.root.position.x, y: ctrl.root.position.y, z: ctrl.root.position.z },
          visible: ctrl.root.visible
        };
      };

      return {
        doom: measure(dbg.villain, 'Doctor Doom'),
        ironMan: measure(dbg.hero, 'Iron Man'),
        spiderman: measure(dbg.spiderMan, 'Spider-Man'),
      };
    })()
  `);
  console.log('Scale and Transform details:', JSON.stringify(boxInfo, null, 2));

  ws.close();
} finally {
  proc.kill();
}
