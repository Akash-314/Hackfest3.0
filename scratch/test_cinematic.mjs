import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\AKASH\\.gemini\\antigravity-ide\\brain\\fabc5354-7deb-484a-a1f6-f4ca45e84362';
const PORT = 9335;

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log('Launching headless Chrome on port ' + PORT + '...');
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
    for (let i = 0; i < 20; i++) {
      await sleep(500);
      try {
        const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
        const json = await res.json();
        if (json && json.length > 0 && json[0].webSocketDebuggerUrl) {
          wsUrl = json[0].webSocketDebuggerUrl;
          break;
        }
      } catch (e) {
        // retry
      }
    }

    if (!wsUrl) {
      throw new Error('Failed to connect to Chrome debugging endpoint');
    }

    console.log('Connected to Chrome CDP:', wsUrl);
    const ws = new WebSocket(wsUrl);

    let id = 1;
    const callbacks = new Map();
    const consoleLogs = [];

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && callbacks.has(msg.id)) {
        const cb = callbacks.get(msg.id);
        callbacks.delete(msg.id);
        if (msg.error) cb.reject(new Error(msg.error.message));
        else cb.resolve(msg.result);
      }
      if (msg.method === 'Runtime.consoleAPICalled') {
        const text = msg.params.args.map((a) => a.value ?? a.description ?? JSON.stringify(a)).join(' ');
        console.log(`[BROWSER CONSOLE ${msg.params.type}]: ${text}`);
        consoleLogs.push({ type: msg.params.type, text });
      }
    };

    const send = (method, params = {}) => {
      return new Promise((resolve, reject) => {
        const msgId = id++;
        callbacks.set(msgId, { resolve, reject });
        ws.send(JSON.stringify({ id: msgId, method, params }));
      });
    };

    await new Promise((resolve) => (ws.onopen = resolve));

    await send('Page.enable');
    await send('Runtime.enable');

    console.log('Navigating to http://localhost:5173 ...');
    await send('Page.navigate', { url: 'http://localhost:5173' });

    await sleep(4000);

    // Evaluate click on Enter Hackfest button if present
    const clickRes = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btns = Array.from(document.querySelectorAll('button, [role="button"]'));
          const enterBtn = btns.find(b => b.textContent && b.textContent.includes('ENTER'));
          if (enterBtn) {
            enterBtn.click();
            return 'clicked enter button: ' + enterBtn.textContent.trim();
          }
          return 'no enter button found';
        })()
      `,
    });
    console.log('Enter button status:', clickRes?.result?.value);

    await sleep(2000);

    // Helper to capture screenshot
    const capture = async (filename, label) => {
      console.log(`Capturing: ${label} -> ${filename}...`);
      const { data } = await send('Page.captureScreenshot', { format: 'png' });
      const filePath = path.join(ARTIFACT_DIR, filename);
      fs.writeFileSync(filePath, Buffer.from(data, 'base64'));
      console.log(`Saved screenshot to ${filePath}`);
    };

    // Helper to scroll
    const scrollToProgress = async (prog) => {
      await send('Runtime.evaluate', {
        expression: `
          (() => {
            const container = document.getElementById('cinematic-intro');
            if (!container) return;
            const total = container.offsetHeight - window.innerHeight;
            window.scrollTo(0, total * ${prog});
          })()
        `,
      });
      await sleep(1200);
    };

    // 1. Initial Deep Space & Planet Flyby (prog 0.14)
    await scrollToProgress(0.14);
    await capture('portal_01_planet_flyby.png', 'Stage 1: 3D Planet Flyby & Space');

    // 2. Doctor Strange Portal Opening & Energy Arcs (prog 0.32)
    await scrollToProgress(0.32);
    await capture('portal_02_strange_portal_opening.png', 'Stage 2: Doctor Strange Portal Opening');

    // 3. HACKFEST 3.0 Title Reveal Inside Portal (prog 0.44)
    await scrollToProgress(0.44);
    await capture('portal_03_title_inside_portal.png', 'Stage 3: HACKFEST 3.0 Title Inside Portal');

    // 4. Iron Man Emerging & Flying Forward Through Portal (prog 0.64)
    await scrollToProgress(0.64);
    await capture('portal_04_ironman_portal_exit.png', 'Stage 4: Iron Man Supersonic Portal Emergence');

    // 5. Upright Heroic Hover Facing Camera (prog 0.82)
    await scrollToProgress(0.82);
    await capture('portal_05_ironman_upright_hover.png', 'Stage 5: Iron Man Upright Heroic Hover');

    // 6. Multiverse Assembly Finale (prog 0.95)
    await scrollToProgress(0.95);
    await capture('portal_06_multiverse_assembly.png', 'Stage 6: Multiverse Assembly Finale');

    // 7. Reverse Scrolling Test back to Portal Flight (prog 0.64)
    await scrollToProgress(0.64);
    await capture('portal_07_reverse_scroll_test.png', 'Stage 7: Reverse Scroll to Portal Flight');

    // Detailed Runtime Model Verification
    const auditRes = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const dbg = window.__CINEMATIC_DEBUG__;
          if (!dbg) return { error: 'No debug object found' };
          const hero = dbg.hero;
          const planet = dbg.cosmicPlanet;
          const portal = dbg.portal;
          return {
            hero: {
              isLoaded: hero?.isLoaded,
              modelName: hero?.model?.name,
              visible: hero?.root?.visible,
              rootPos: hero?.root?.position ? [hero.root.position.x, hero.root.position.y, hero.root.position.z] : null,
              modelRot: hero?.model?.rotation ? [hero.model.rotation.x, hero.model.rotation.y, hero.model.rotation.z] : null,
              pivotRot: hero?.characterPivot?.rotation ? [hero.characterPivot.rotation.x, hero.characterPivot.rotation.y, hero.characterPivot.rotation.z] : null,
              arcReactorIntensity: hero?.arcReactorLight?.intensity,
              armorKeyIntensity: hero?.armorKeyLight?.intensity
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
              rimIntensity: portal?.rimLight?.intensity,
              titleOpacity: portal?.titleMat?.opacity
            }
          };
        })()
      `,
      returnByValue: true,
    });
    console.log('\n--- VERIFICATION AUDIT DATA ---');
    console.log(JSON.stringify(auditRes?.result?.value, null, 2));

    console.log('\nAll browser verification steps completed successfully!');
    ws.close();
  } finally {
    chromeProcess.kill();
  }
}

main().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
