import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9228;
const ARTIFACT_DIR = 'C:\\Users\\AKASH\\.gemini\\antigravity-ide\\brain\\fabc5354-7deb-484a-a1f6-f4ca45e84362';

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
  console.log('Launching headless Edge on port', PORT);
  const edge = spawn(EDGE_PATH, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--no-sandbox',
    '--disable-gpu',
    '--window-size=1600,900',
    'http://localhost:5173/',
  ]);

  let targets = null;
  for (let i = 0; i < 25; i++) {
    await new Promise((r) => setTimeout(r, 400));
    try {
      targets = await fetchJson(`http://127.0.0.1:${PORT}/json`);
      if (targets && targets.some((t) => t.type === 'page')) break;
    } catch {}
  }

  const page = targets.find((t) => t.type === 'page');
  if (!page) {
    console.error('Page target not found');
    edge.kill();
    return;
  }

  console.log('Connecting to page ws:', page.webSocketDebuggerUrl);
  const ws = new WebSocket(page.webSocketDebuggerUrl);

  let idCounter = 1;
  const pending = new Map();

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = idCounter++;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.method === 'Runtime.consoleAPICalled') {
      const text = msg.params.args.map((a) => a.value || a.description).join(' ');
      console.log('[CONSOLE]', msg.params.type, text);
    } else if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(msg.error);
      else resolve(msg.result);
    }
  };

  await new Promise((r) => (ws.onopen = r));
  console.log('Connected to CDP WebSocket');

  await send('Runtime.enable');
  await send('Page.enable');
  await send('DOM.enable');

  // Wait 4s for assets to load
  await new Promise((r) => setTimeout(r, 4500));

  // Dismiss / Enter mission
  const evalResult = await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = document.querySelector('.enter-btn, .btn-enter-mission, button');
      if (btn) {
        btn.click();
        return 'BUTTON_CLICKED: ' + btn.textContent.trim();
      }
      return 'NO_BUTTON_FOUND';
    })()`,
  });
  console.log('Enter button status:', evalResult.result.value);

  await new Promise((r) => setTimeout(r, 1500));

  async function capture(filename, label) {
    console.log(`Capturing: ${label} -> ${filename}...`);
    const ss = await send('Page.captureScreenshot', { format: 'png' });
    const fullPath = path.join(ARTIFACT_DIR, filename);
    fs.writeFileSync(fullPath, Buffer.from(ss.data, 'base64'));
    console.log(`Saved ${filename} (${(ss.data.length / 1024).toFixed(1)} KB)`);
  }

  async function scrollTo(prog) {
    await send('Runtime.evaluate', {
      expression: `(() => {
        const intro = document.getElementById('cinematic-intro');
        if (intro) {
          const total = intro.offsetHeight - window.innerHeight;
          window.scrollTo(0, total * ${prog});
        }
      })()`,
    });
    // Allow Three.js smooth lerp to settle completely
    await new Promise((r) => setTimeout(r, 2200));
  }

  // 1. Deep Space Arrival (progress = 0.04)
  await scrollTo(0.04);
  await capture('spacecraft_01_deep_space.png', 'Scene 1: Deep Space Arrival');

  // 2. Space Fighter Supersonic Flyby (progress = 0.16)
  await scrollTo(0.16);
  await capture('spacecraft_02_supersonic_flyby.png', 'Scene 2: Space Fighter Supersonic Flyby');

  // 3. Planetary Exploration (progress = 0.28)
  await scrollTo(0.28);
  await capture('spacecraft_03_planet_exploration.png', 'Scene 3: Planetary Exploration');

  // 4. Doctor Strange Portal & Title Reveal (progress = 0.44)
  await scrollTo(0.44);
  await capture('spacecraft_04_portal_and_title.png', 'Scene 4: Doctor Strange Portal & Title Reveal');

  // 5. Iron Man Supersonic Portal Exit (progress = 0.64)
  await scrollTo(0.64);
  await capture('spacecraft_05_ironman_portal_exit.png', 'Scene 5: Iron Man Portal Exit');

  // 6. Iron Man Straight Upright Heroic Hover (progress = 0.82)
  await scrollTo(0.82);
  await capture('spacecraft_06_ironman_upright_hover.png', 'Scene 5 (cont): Iron Man Straight Upright Heroic Hover');

  // 7. Final Cosmic Composition & Multiverse Vanguard (progress = 0.96)
  await scrollTo(0.96);
  await capture('spacecraft_07_multiverse_vanguard.png', 'Scene 6: Final Cosmic Composition & Multiverse Vanguard');

  // 8. Reversibility check: Scroll back to Scene 2 flyby (progress = 0.16)
  await scrollTo(0.16);
  await capture('spacecraft_08_reverse_scroll.png', 'Reversibility: Reverse Scroll to Spacecraft Flyby');

  // Audit runtime states
  const auditRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const dbg = window.__CINEMATIC_DEBUG__;
      if (!dbg) return { error: 'No debug object found' };
      const hero = dbg.hero;
      const spacecraft = dbg.spacecraft;
      const planet = dbg.cosmicPlanet;
      const portal = dbg.portal;
      return {
        spacecraft: {
          isLoaded: spacecraft?.isLoaded,
          modelName: spacecraft?.model?.name,
          visible: spacecraft?.root?.visible,
          pos: spacecraft?.root?.position ? [spacecraft.root.position.x, spacecraft.root.position.y, spacecraft.root.position.z] : null,
          flightPivotRot: spacecraft?.flightPivot?.rotation ? [spacecraft.flightPivot.rotation.x, spacecraft.flightPivot.rotation.y, spacecraft.flightPivot.rotation.z] : null,
          thrusterOpacity: spacecraft?.materials?.thruster?.opacity
        },
        hero: {
          isLoaded: hero?.isLoaded,
          modelName: hero?.model?.name,
          visible: hero?.root?.visible,
          rootPos: hero?.root?.position ? [hero.root.position.x, hero.root.position.y, hero.root.position.z] : null,
          flightPivotRot: hero?.flightPivot?.rotation ? [hero.flightPivot.rotation.x, hero.flightPivot.rotation.y, hero.flightPivot.rotation.z] : null,
          correctionRot: hero?.modelCorrectionGroup?.rotation ? [hero.modelCorrectionGroup.rotation.x, hero.modelCorrectionGroup.rotation.y, hero.modelCorrectionGroup.rotation.z] : null,
          arcReactorIntensity: hero?.arcReactorLight?.intensity
        },
        planet: {
          isLoaded: planet?.isLoaded,
          modelName: planet?.model?.name,
          visible: planet?.root?.visible,
          pos: planet?.root?.position ? [planet.root.position.x, planet.root.position.y, planet.root.position.z] : null
        },
        portal: {
          visible: portal?.root?.visible,
          scale: portal?.root?.scale?.x,
          titleOpacity: portal?.titleMat?.opacity
        }
      };
    })()`,
    returnByValue: true,
  });
  console.log('\n--- VERIFICATION AUDIT DATA ---');
  console.log(JSON.stringify(auditRes.result.value, null, 2));

  console.log('\nAll verification steps completed!');
  ws.close();
  edge.kill();
}

run().catch((e) => {
  console.error('Run error:', e);
  process.exit(1);
});
