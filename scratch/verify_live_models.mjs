import { spawn } from 'child_process';

const proc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9508',
  '--remote-allow-origins=*',
  '--window-size=1280,720',
  '--disable-gpu',
  'http://localhost:5173'
]);

await new Promise((r) => setTimeout(r, 2000));
try {
  const res = await fetch('http://127.0.0.1:9508/json/list');
  const targets = await res.json();
  const pageTarget = targets.find((t) => t.url.includes('5173')) || targets[0];
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
  
  // Wait for models to load
  await new Promise((r) => setTimeout(r, 6000));

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

  const debugInfo = await runCode(`
    (() => {
      const dbg = window.__CINEMATIC_DEBUG__;
      if (!dbg) return { error: 'window.__CINEMATIC_DEBUG__ not found' };
      
      const inspect = (controller, name) => {
        if (!controller) return { name, status: 'missing' };
        const m = controller.model;
        let box = null;
        let meshCount = 0;
        let meshes = [];
        if (m) {
          m.traverse(c => {
            if (c.isMesh) {
              meshCount++;
              meshes.push(c.name);
            }
          });
          const b = new dbg.scene.children[0].constructor().setFromObject ? null : null;
        }
        return {
          name,
          isLoaded: controller.isLoaded,
          hasModel: Boolean(m),
          rootVisible: controller.root ? controller.root.visible : null,
          rootPos: controller.root ? { x: controller.root.position.x, y: controller.root.position.y, z: controller.root.position.z } : null,
          meshCount,
          meshes: meshes.slice(0, 5)
        };
      };

      return {
        villain: inspect(dbg.villain, 'Doctor Doom'),
        hero: inspect(dbg.hero, 'Iron Man'),
        spiderMan: inspect(dbg.spiderMan, 'Spider-Man'),
        cosmicPlanet: inspect(dbg.cosmicPlanet, 'Cosmic Planet'),
        lightningWarrior: inspect(dbg.lightningWarrior, 'Thor Controller'),
      };
    })()
  `);
  console.log('Model Loading Runtime State:');
  console.log(JSON.stringify(debugInfo, null, 2));

  // Now test each scene's visibility:
  const scenes = [
    { name: 'Scene 1: Space', progress: 0.05 },
    { name: 'Scene 2: Planet', progress: 0.18 },
    { name: 'Scene 3: Doom', progress: 0.35 },
    { name: 'Scene 4: Thor Slot', progress: 0.50 },
    { name: 'Scene 5: Iron Man', progress: 0.65 },
    { name: 'Scene 6: Spider-Man', progress: 0.80 },
    { name: 'Scene 7: Assembly', progress: 0.95 },
  ];

  for (const s of scenes) {
    const visibilityAtProgress = await runCode(`
      (() => {
        const dbg = window.__CINEMATIC_DEBUG__;
        if (!dbg) return null;
        
        // Simulate update at progress
        const p = ${s.progress};
        dbg.cosmicPlanet.update(p, 10);
        dbg.villain.update(p, 10);
        dbg.lightningWarrior.update(p, 10);
        dbg.hero.update(p, 10);
        dbg.spiderMan.update(p, 10);

        return {
          planet: dbg.cosmicPlanet.root.visible,
          doom: dbg.villain.root.visible,
          ironMan: dbg.hero.root.visible,
          spiderMan: dbg.spiderMan.root.visible,
          thor: dbg.lightningWarrior.root.visible
        };
      })()
    `);
    console.log(s.name, '(p=' + s.progress + '):', visibilityAtProgress);
  }

  ws.close();
} finally {
  proc.kill();
}
