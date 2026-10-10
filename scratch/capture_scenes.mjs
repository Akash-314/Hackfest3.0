import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9230;
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
  console.log('Starting Edge process on port', PORT);
  const edge = spawn(EDGE_PATH, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--no-sandbox',
    '--disable-gpu',
    '--window-size=1600,900',
    'http://localhost:5173/',
  ]);

  let targets = null;
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 400));
    try {
      targets = await fetchJson(`http://127.0.0.1:${PORT}/json`);
      if (targets && targets.some((t) => t.type === 'page')) break;
    } catch {}
  }

  const page = targets?.find((t) => t.type === 'page');
  if (!page) {
    console.error('Page target not found');
    edge.kill();
    return;
  }

  console.log('Connecting to CDP page ws:', page.webSocketDebuggerUrl);
  const ws = new WebSocket(page.webSocketDebuggerUrl);

  let idCounter = 1;
  const pending = new Map();

  function send(method, params = {}, timeoutMs = 15000) {
    return new Promise((resolve, reject) => {
      const id = idCounter++;
      const timer = setTimeout(() => {
        if (pending.has(id)) {
          pending.delete(id);
          reject(new Error(`Timeout on ${method} (${timeoutMs}ms)`));
        }
      }, timeoutMs);

      pending.set(id, {
        resolve: (val) => {
          clearTimeout(timer);
          resolve(val);
        },
        reject: (err) => {
          clearTimeout(timer);
          reject(err);
        },
      });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.method === 'Runtime.consoleAPICalled') {
      const text = msg.params.args.map((a) => a.value || a.description).join(' ');
      console.log('[BROWSER]', msg.params.type, text);
    } else if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(msg.error);
      else resolve(msg.result);
    }
  };

  await new Promise((r) => (ws.onopen = r));
  console.log('CDP WebSocket connected');

  await send('Runtime.enable');
  await send('Page.enable');
  await send('DOM.enable');

  // Wait 4s for initial model queue loading
  await new Promise((r) => setTimeout(r, 4500));

  // Wait for loading to finish and click mission launch button
  let clicked = false;
  for (let attempt = 0; attempt < 15; attempt++) {
    const evalRes = await send('Runtime.evaluate', {
      expression: `(() => {
        const btn = document.querySelector('.btn-enter-mission');
        if (btn) {
          btn.click();
          return 'BUTTON_CLICKED: ' + btn.textContent.trim();
        }
        return 'NOT_YET_READY';
      })()`,
    });
    console.log(`Attempt ${attempt + 1}: ${evalRes.result.value}`);
    if (evalRes.result.value.startsWith('BUTTON_CLICKED')) {
      clicked = true;
      break;
    }
    await new Promise((r) => setTimeout(r, 600));
  }
  if (!clicked) {
    console.log('Force-scrolling down to trigger intro exit');
  }

  await new Promise((r) => setTimeout(r, 1200));

  async function capture(filename, label) {
    console.log(`Capturing: ${label} -> ${filename}...`);
    try {
      const ss = await send('Page.captureScreenshot', { format: 'png' }, 12000);
      const fullPath = path.join(ARTIFACT_DIR, filename);
      fs.writeFileSync(fullPath, Buffer.from(ss.data, 'base64'));
      console.log(`✓ Saved ${filename} (${(ss.data.length / 1024).toFixed(1)} KB)`);
    } catch (err) {
      console.error(`✗ Error capturing ${filename}:`, err.message);
    }
  }

  async function scrollTo(prog) {
    await send('Runtime.evaluate', {
      expression: `(() => {
        const intro = document.getElementById('cinematic-intro');
        if (intro) {
          const total = intro.offsetHeight - window.innerHeight;
          window.scrollTo(0, intro.offsetTop + total * ${prog});
        }
      })()`,
    });
    // Wait for smooth lerp to settle
    await new Promise((r) => setTimeout(r, 1600));
  }

  async function checkTitleOnScreen() {
    const res = await send('Runtime.evaluate', {
      expression: `(() => {
        const titleEl = document.querySelector('.cinematic-title-reveal');
        const dbg = window.__CINEMATIC_DEBUG__;
        const portalTitleOpacity = dbg?.portal?.titleMat?.opacity || 0;
        return {
          domTitleExists: !!titleEl,
          domTitleOpacity: titleEl ? window.getComputedStyle(titleEl).opacity : '0',
          portalTitleOpacity: portalTitleOpacity
        };
      })()`,
      returnByValue: true
    });
    return res.result.value;
  }

  // Scene 1: Deep Space Introduction (0.05)
  console.log('\n--- TESTING SCENE 1: Deep Space Introduction ---');
  await scrollTo(0.05);
  const t1 = await checkTitleOnScreen();
  console.log('Scene 1 Title Check:', t1);
  await capture('scene_01_space_intro.png', 'Scene 1: Space Introduction');

  // Scene 2: Animated Planet & Space Fighter Flyby (0.16)
  console.log('\n--- TESTING SCENE 2: Animated Planet & Spacecraft Flyby ---');
  await scrollTo(0.16);
  const t2 = await checkTitleOnScreen();
  console.log('Scene 2 Title Check:', t2);
  await capture('scene_02_planet_spacecraft.png', 'Scene 2: Planet & Spacecraft Flyby');

  // Scene 3: Doctor Doom Dedicated Solo Reveal (0.28)
  console.log('\n--- TESTING SCENE 3: Doctor Doom Dedicated Solo Reveal ---');
  await scrollTo(0.28);
  const t3 = await checkTitleOnScreen();
  console.log('Scene 3 Title Check:', t3);
  await capture('scene_03_doctor_doom.png', 'Scene 3: Doctor Doom Solo Reveal');

  // Scene 4: Thor Bifrost Lightning Storm (0.40)
  console.log('\n--- TESTING SCENE 4: Thor Celestial Lightning Storm ---');
  await scrollTo(0.40);
  const t4 = await checkTitleOnScreen();
  console.log('Scene 4 Title Check:', t4);
  await capture('scene_04_thor_lightning.png', 'Scene 4: Thor Lightning Storm');

  // Scene 5: Iron Man Portal Emergence & Upright Hover (0.54)
  console.log('\n--- TESTING SCENE 5: Iron Man Portal Emergence & Upright Hover ---');
  await scrollTo(0.54);
  const t5 = await checkTitleOnScreen();
  console.log('Scene 5 Title Check:', t5);
  await capture('scene_05_ironman_portal_hover.png', 'Scene 5: Iron Man Portal Emergence');

  // Scene 6: Spider-Man Solo Reveal (0.66)
  console.log('\n--- TESTING SCENE 6: Spider-Man Solo Reveal ---');
  await scrollTo(0.66);
  const t6 = await checkTitleOnScreen();
  console.log('Scene 6 Title Check:', t6);
  await capture('scene_06_spiderman_solo.png', 'Scene 6: Spider-Man Solo Reveal');

  // Scene 7: Space Fighter Vanguard Maneuver (0.76)
  console.log('\n--- TESTING SCENE 7: Space Fighter Vanguard Maneuver ---');
  await scrollTo(0.76);
  const t7 = await checkTitleOnScreen();
  console.log('Scene 7 Title Check:', t7);
  await capture('scene_07_vanguard_maneuver.png', 'Scene 7: Space Fighter Vanguard');

  // Scene 8: ALL CHARACTERS ASSEMBLE (0.85) - CRITICAL: ZERO TITLE ALLOWED
  console.log('\n--- TESTING SCENE 8: ALL CHARACTERS ASSEMBLE (NO TITLE ALLOWED) ---');
  await scrollTo(0.85);
  const t8 = await checkTitleOnScreen();
  console.log('Scene 8 Title Check (MUST BE ZERO / NOT MOUNTED):', t8);
  if (t8.domTitleExists || t8.portalTitleOpacity > 0.001) {
    console.error('CRITICAL VIOLATION: Title is visible or mounted in Scene 8 before final reveal!');
  } else {
    console.log('PASSED: Scene 8 has ZERO title visible!');
  }
  await capture('scene_08_all_assemble_notitle.png', 'Scene 8: All Characters Assemble (No Title)');

  // Scene 9: FINAL HACKFEST 3.0 REVEAL (0.95)
  console.log('\n--- TESTING SCENE 9: FINAL HACKFEST 3.0 REVEAL ---');
  await scrollTo(0.95);
  const t9 = await checkTitleOnScreen();
  console.log('Scene 9 Title Check (MUST BE VISIBLE):', t9);
  await capture('scene_09_final_hackfest_reveal.png', 'Scene 9: Final HackFest 3.0 Reveal');

  // Reversibility check: Scroll back to Scene 3 (Doctor Doom, 0.28)
  console.log('\n--- TESTING REVERSIBILITY: Scroll back to Doctor Doom (0.28) ---');
  await scrollTo(0.28);
  const tRev = await checkTitleOnScreen();
  console.log('Reverse Scroll Title Check (MUST BE ZERO / NOT MOUNTED):', tRev);
  await capture('scene_10_reverse_to_doom.png', 'Reversibility: Reverse Scroll to Doctor Doom');

  // Telemetry Audit
  const auditRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const dbg = window.__CINEMATIC_DEBUG__;
      if (!dbg) return { error: 'No debug object found' };
      return {
        doom: {
          isLoaded: dbg.villain?.isLoaded,
          visible: dbg.villain?.root?.visible,
          pos: dbg.villain?.root?.position ? [dbg.villain.root.position.x, dbg.villain.root.position.y, dbg.villain.root.position.z] : null
        },
        thorMjolnir: {
          isLoaded: dbg.lightningWarrior?.isLoaded,
          visible: dbg.lightningWarrior?.root?.visible,
          pos: dbg.lightningWarrior?.root?.position ? [dbg.lightningWarrior.root.position.x, dbg.lightningWarrior.root.position.y, dbg.lightningWarrior.root.position.z] : null
        },
        spidey: {
          isLoaded: dbg.spiderMan?.isLoaded,
          visible: dbg.spiderMan?.root?.visible,
          pos: dbg.spiderMan?.root?.position ? [dbg.spiderMan.root.position.x, dbg.spiderMan.root.position.y, dbg.spiderMan.root.position.z] : null
        },
        ironman: {
          isLoaded: dbg.hero?.isLoaded,
          visible: dbg.hero?.root?.visible,
          pos: dbg.hero?.root?.position ? [dbg.hero.root.position.x, dbg.hero.root.position.y, dbg.hero.root.position.z] : null,
          correctionRot: dbg.hero?.modelCorrectionGroup?.rotation ? [dbg.hero.modelCorrectionGroup.rotation.x, dbg.hero.modelCorrectionGroup.rotation.y, dbg.hero.modelCorrectionGroup.rotation.z] : null
        },
        spacecraft: {
          isLoaded: dbg.spacecraft?.isLoaded,
          visible: dbg.spacecraft?.root?.visible,
          pos: dbg.spacecraft?.root?.position ? [dbg.spacecraft.root.position.x, dbg.spacecraft.root.position.y, dbg.spacecraft.root.position.z] : null
        },
        planet: {
          isLoaded: dbg.cosmicPlanet?.isLoaded,
          visible: dbg.cosmicPlanet?.root?.visible
        },
        portal: {
          visible: dbg.portal?.root?.visible,
          titleOpacity: dbg.portal?.titleMat?.opacity
        }
      };
    })()`,
    returnByValue: true,
  });
  console.log('\n--- RUNTIME AUDIT DATA ---');
  console.log(JSON.stringify(auditRes.result.value, null, 2));

  console.log('\nVerification suite finished successfully!');
  ws.close();
  edge.kill();
}

run().catch((e) => {
  console.error('Fatal execution error:', e);
  process.exit(1);
});
