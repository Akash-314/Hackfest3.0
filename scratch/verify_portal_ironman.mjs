import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\AKASH\\.gemini\\antigravity-ide\\brain\\fabc5354-7deb-484a-a1f6-f4ca45e84362';
const PORT = 9334;

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log('Launching headless Chrome on port ' + PORT);
  const chromeProcess = spawn(
    CHROME_PATH,
    [
      '--headless=new',
      `--remote-debugging-port=${PORT}`,
      '--window-size=1600,900',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--mute-audio',
      '--no-first-run',
      '--no-default-browser-check',
      'about:blank',
    ],
    { stdio: 'ignore' }
  );

  try {
    let wsUrl = null;
    for (let i = 0; i < 25; i++) {
      await sleep(400);
      try {
        const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
        const json = await res.json();
        if (json && json.length > 0 && json[0].webSocketDebuggerUrl) {
          wsUrl = json[0].webSocketDebuggerUrl;
          break;
        }
      } catch (e) {}
    }

    if (!wsUrl) throw new Error('Could not connect to Chrome CDP endpoint');

    console.log('Connected to CDP:', wsUrl);
    const ws = new WebSocket(wsUrl);

    let id = 1;
    const callbacks = new Map();
    const consoleLogs = [];

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.method === 'Runtime.consoleAPICalled') {
        const text = msg.params.args.map((a) => a.value || JSON.stringify(a)).join(' ');
        consoleLogs.push(text);
        console.log('[BROWSER CONSOLE]', text);
      }
      if (msg.id && callbacks.has(msg.id)) {
        const cb = callbacks.get(msg.id);
        callbacks.delete(msg.id);
        cb(msg.result);
      }
    };

    const send = (method, params = {}) => {
      return new Promise((resolve) => {
        const curId = id++;
        callbacks.set(curId, resolve);
        ws.send(JSON.stringify({ id: curId, method, params }));
      });
    };

    await new Promise((res) => (ws.onopen = res));

    await send('Page.enable');
    await send('Runtime.enable');
    await send('DOM.enable');

    console.log('Navigating to http://localhost:5173/ ...');
    await send('Page.navigate', { url: 'http://localhost:5173/' });

    // Wait for page load and assets
    await sleep(3500);

    // Dismiss loading screen / click Enter if present
    const evalRes = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = document.querySelector('.enter-btn, button, [role="button"]');
          if (btn) btn.click();
          return { clicked: !!btn };
        })()
      `,
      returnByValue: true,
    });
    console.log('Enter button clicked:', evalRes?.result?.value);

    await sleep(1500);

    const screenshot = async (filename) => {
      const capture = await send('Page.captureScreenshot', { format: 'png' });
      if (capture && capture.data) {
        const outPath = path.join(ARTIFACT_DIR, filename);
        fs.writeFileSync(outPath, Buffer.from(capture.data, 'base64'));
        console.log(`Saved screenshot: ${outPath} (${(capture.data.length / 1024).toFixed(1)} KB)`);
        return outPath;
      }
    };

    // Scroll test function
    const scrollToProgress = async (prog) => {
      await send('Runtime.evaluate', {
        expression: `
          (() => {
            const container = document.getElementById('cinematic-intro');
            if (!container) return { error: 'No container' };
            const maxScroll = container.offsetHeight - window.innerHeight;
            const targetY = maxScroll * ${prog};
            window.scrollTo(0, targetY);
            return {
              progress: ${prog},
              targetY,
              containerH: container.offsetHeight,
              windowH: window.innerHeight,
              scrollY: window.scrollY
            };
          })()
        `,
        returnByValue: true,
      });
      // Allow Three.js smoothed lerp to settle
      await sleep(900);
    };

    // 1. Stage 1: Planet Flyby (p = 0.14)
    console.log('\n--- TESTING STAGE 1: 3D PLANET FLYBY (p = 0.14) ---');
    await scrollToProgress(0.14);
    await screenshot('verify_01_planet_flyby.png');

    // 2. Stage 2: Doctor Strange Portal Opening (p = 0.30)
    console.log('\n--- TESTING STAGE 2: DOCTOR STRANGE PORTAL OPENING (p = 0.30) ---');
    await scrollToProgress(0.30);
    await screenshot('verify_02_portal_expanding.png');

    // 3. Stage 3: HACKFEST 3.0 Title Inside Portal (p = 0.45)
    console.log('\n--- TESTING STAGE 3: HACKFEST 3.0 TITLE INSIDE PORTAL (p = 0.45) ---');
    await scrollToProgress(0.45);
    await screenshot('verify_03_title_inside_portal.png');

    // 4. Stage 4: Iron Man Flying Forward Through Portal (p = 0.65)
    console.log('\n--- TESTING STAGE 4: IRON MAN SUPERSONIC PORTAL FLIGHT (p = 0.65) ---');
    await scrollToProgress(0.65);
    await screenshot('verify_04_ironman_portal_flight.png');

    // 5. Stage 5: Upright Heroic Hover (p = 0.82)
    console.log('\n--- TESTING STAGE 5: UPRIGHT HEROIC HOVER (p = 0.82) ---');
    await scrollToProgress(0.82);
    await screenshot('verify_05_ironman_upright_hover.png');

    // 6. Stage 6: Superhero Assembly (p = 0.94)
    console.log('\n--- TESTING STAGE 6: SUPERHERO MULTIVERSE ASSEMBLY (p = 0.94) ---');
    await scrollToProgress(0.94);
    await screenshot('verify_06_multiverse_assembly.png');

    // Runtime state audit
    const stateAudit = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const dbg = window.__CINEMATIC_DEBUG__;
          if (!dbg) return { error: 'Debug object not found' };
          const hero = dbg.hero;
          const planet = dbg.cosmicPlanet;
          const portal = dbg.portal;
          return {
            hero: {
              isLoaded: hero?.isLoaded,
              modelName: hero?.model?.name,
              rootPos: hero?.root?.position ? [hero.root.position.x, hero.root.position.y, hero.root.position.z] : null,
              modelRot: hero?.model?.rotation ? [hero.model.rotation.x, hero.model.rotation.y, hero.model.rotation.z] : null,
              pivotRot: hero?.characterPivot?.rotation ? [hero.characterPivot.rotation.x, hero.characterPivot.rotation.y, hero.characterPivot.rotation.z] : null,
              arcLightIntensity: hero?.arcReactorLight?.intensity,
              visible: hero?.root?.visible
            },
            planet: {
              isLoaded: planet?.isLoaded,
              visible: planet?.root?.visible,
              modelName: planet?.model?.name,
              pos: planet?.root?.position ? [planet.root.position.x, planet.root.position.y, planet.root.position.z] : null
            },
            portal: {
              visible: portal?.root?.visible,
              scale: portal?.root?.scale ? portal.root.scale.x : null,
              rimIntensity: portal?.rimLight?.intensity,
              titleOpacity: portal?.titleMat?.opacity
            }
          };
        })()
      `,
      returnByValue: true,
    });
    console.log('\n--- RUNTIME AUDIT REPORT ---');
    console.log(JSON.stringify(stateAudit?.result?.value, null, 2));

    ws.close();
  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    try {
      chromeProcess.kill();
    } catch (e) {}
  }
}

main();
