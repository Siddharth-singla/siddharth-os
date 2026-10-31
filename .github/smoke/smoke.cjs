// Smoke check run by CI: opens the built site in headless Chromium at desktop and
// phone sizes, drives it through real commands, records errors and takes screenshots.
const { chromium } = require("playwright");
const fs = require("fs");

const URL = process.env.SITE_URL || "http://localhost:4173/";
const OUT = process.env.SHOTS_DIR || "shots";

const VIEWPORTS = [
  { name: "desktop", viewport: { width: 1440, height: 900 } },
  { name: "mobile", viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
];

// [command typed into the console, screenshot label, text expected in the console log]
const COMMANDS = [
  ["/play", "play", "OPENING PLAY.EXE"],
  ["tell me about savoury", "savoury-card", "SAVOURY"],
  ["show me his open source", "open-source", "4 MERGED"],
  ["projects dikhao", "build", "SYSTEM MODULES"],
  ["what did he ship", "live-filter", "LIVE ON THE INTERNET"],
  ["what should I build next?", "final", "IDEAS INBOX"],
];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const report = [];
  let failures = 0;
  const browser = await chromium.launch();

  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({
      viewport: vp.viewport,
      isMobile: !!vp.isMobile,
      hasTouch: !!vp.hasTouch,
      deviceScaleFactor: vp.deviceScaleFactor || 1,
    });
    const page = await ctx.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(`console: ${m.text()}`);
    });

    page.on("console", (m) => {
      if (m.type() === "warning" && /AudioContext/.test(m.text())) errors.push(`audio warning: ${m.text().slice(0, 80)}`);
    });
    await page.goto(URL, { waitUntil: "networkidle" });
    // hover before any click, like a visitor would; this must not try to start audio
    await page.waitForSelector("[data-testid=boot-examples] button", { timeout: 20000 }).catch(() => {});
    await page.hover("[data-testid=boot-examples] button").catch(() => {});
    await page.waitForTimeout(300);
    await page.waitForSelector("[data-testid=boot-command-input]", { timeout: 20000 });
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${OUT}/${vp.name}-01-boot.png` });
    const bootBox = await page.evaluate(() => {
      const r = document.querySelector("[data-testid=boot-command-input]").closest("form").getBoundingClientRect();
      return { left: Math.round(r.left), right: Math.round(r.right), vw: window.innerWidth };
    });
    const bootOk = bootBox.right <= bootBox.vw;
    if (!bootOk) failures++;
    report.push(`${vp.name} | boot input fits screen | ${bootOk ? "OK" : `FAIL right=${bootBox.right} vw=${bootBox.vw}`}`);

    await page.fill("[data-testid=boot-command-input]", "show me his AI work");
    await page.press("[data-testid=boot-command-input]", "Enter");
    await page.waitForTimeout(6500);
    await page.screenshot({ path: `${OUT}/${vp.name}-02-ai-filter.png` });
    // on phones the console has closed itself by now; the log is kept, so reopen it to read
    if (!(await page.$("[data-testid=voice-dock-log]"))) {
      await page.click("[data-testid=voice-dock-button]");
      await page.waitForTimeout(400);
    }
    const firstLog = (await page.textContent("[data-testid=voice-dock-log]").catch(() => "")) || "";
    const aiOk = /AI MEETING ASSISTANT/.test(firstLog);
    if (!aiOk) failures++;
    report.push(`${vp.name} | boot command "show me his AI work" | ${aiOk ? "OK" : "FAIL"}`);

    let n = 3;
    for (const [cmd, label, expect] of COMMANDS) {
      // on phones the console closes itself after navigating, so reopen it if needed
      if (!(await page.$("[data-testid=voice-dock-input]"))) {
        await page.click("[data-testid=voice-dock-button]");
        await page.waitForTimeout(400);
      }
      await page.fill("[data-testid=voice-dock-input]", cmd);
      await page.press("[data-testid=voice-dock-input]", "Enter");
      await page.waitForTimeout(2600);
      const log = (await page.textContent("[data-testid=voice-dock-log]").catch(() => "")) || "";
      const ok = log.includes(expect);
      await page.waitForTimeout(1600);
      if (!ok) failures++;
      const y = await page.evaluate(() => Math.round(window.scrollY));
      report.push(`${vp.name} | "${cmd}" | ${ok ? "OK" : "FAIL (expected " + expect + ")"} | scrollY=${y}`);
      // close the console so it doesn't cover the screenshot
      if (await page.$("[data-testid=voice-dock-close-button]")) {
        await page.click("[data-testid=voice-dock-close-button]").catch(() => {});
      }
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${OUT}/${vp.name}-${String(n++).padStart(2, "0")}-${label}.png` });
    }

    const clock = await page.textContent("[data-testid=play-match-clock]").catch(() => "?");
    report.push(`${vp.name} | match clock | ${clock}`);
    const check = (label, ok, detail = "") => {
      if (!ok) failures++;
      report.push(`${vp.name} | ${label} | ${ok ? "OK" : "FAIL"}${detail ? " " + detail : ""}`);
    };
    const reopenDock = async () => {
      if (!(await page.$("[data-testid=voice-dock-input]"))) {
        await page.click("[data-testid=voice-dock-button]");
        await page.waitForTimeout(400);
      }
    };
    const closeDock = async () => {
      if (await page.$("[data-testid=voice-dock-close-button]")) await page.click("[data-testid=voice-dock-close-button]");
      await page.waitForTimeout(300);
    };

    // A project asked for by voice is brought to the centre of the carousel and fully on screen.
    await reopenDock();
    await page.fill("[data-testid=voice-dock-input]", "tell me about savoury");
    await page.press("[data-testid=voice-dock-input]", "Enter");
    await page.waitForTimeout(5200);
    await closeDock();
    // the carousel holds several identical copies so it can loop; any copy of the card counts
    const sav = await page.evaluate(() => {
      const all = [...document.querySelectorAll("article[data-id=MOD-07]")].map((el) => {
        const r = el.getBoundingClientRect();
        return { l: Math.round(r.left), r: Math.round(r.right), t: Math.round(r.top), b: Math.round(r.bottom) };
      });
      const onScreen = all.find((r) => r.l >= -2 && r.r <= innerWidth + 2 && r.t < innerHeight && r.b > 0);
      const centred = onScreen && Math.abs((onScreen.l + onScreen.r) / 2 - innerWidth / 2) < 40;
      const lit = [...document.querySelectorAll("article[data-id=MOD-07]")].some((el) => el.className.includes("border-osc/70"));
      return { ok: !!onScreen, centred: !!centred, lit, all };
    });
    check("voice-focused project is centred on screen", sav.ok && sav.centred, JSON.stringify(sav.all));
    check("voice-focused project is highlighted", sav.lit);
    await page.screenshot({ path: `${OUT}/${vp.name}-20-carousel-focus.png` });

    // Card layout: GitHub/LIVE buttons sit at the bottom right and never cover the big number.
    const layout = await page.evaluate(() => {
      const out = [];
      for (const card of document.querySelectorAll("article[data-testid^=build-project-]")) {
        const c = card.getBoundingClientRect();
        const num = card.querySelector("span[aria-hidden=true]").getBoundingClientRect();
        const links = [...card.querySelectorAll("a")];
        if (!links.length) continue;
        // nothing in the header row may run under the big number
        for (const el of card.querySelectorAll(":scope > [data-card-head] > span")) {
          const r = el.getBoundingClientRect();
          if (!(r.right <= num.left || r.bottom <= num.top || r.top >= num.bottom)) out.push(`${card.dataset.id}: "${el.textContent.trim().slice(0, 16)}" under number`);
        }
        // the group of buttons must sit at the bottom right
        const g = links[0].parentElement.getBoundingClientRect();
        if (!(c.bottom - g.bottom < 60 && c.right - g.right < 60)) out.push(`${card.dataset.id}: buttons not bottom-right`);
        // and no button may cover the project number
        for (const a of links) {
          const r = a.getBoundingClientRect();
          const overlapsNum = !(r.right < num.left || r.left > num.right || r.bottom < num.top || r.top > num.bottom);
          if (overlapsNum) out.push(`${card.dataset.id}:${a.textContent.trim()} overlaps number`);
        }
      }
      return out;
    });
    check("project buttons bottom-right, clear of numbers", layout.length === 0, layout.slice(0, 4).join("; "));

    // Auto-scroll: with the pointer away from it, the carousel keeps moving.
    await page.mouse.move(5, 5);
    await page.waitForTimeout(5000); // the voice focus pauses auto-scroll for a while
    const s1 = await page.evaluate(() => document.querySelector("[data-testid=build-carousel-track]").scrollLeft);
    await page.waitForTimeout(2000);
    const s2 = await page.evaluate(() => document.querySelector("[data-testid=build-carousel-track]").scrollLeft);
    check("carousel auto-scrolls left to right", s2 - s1 > 20, `moved ${Math.round(s2 - s1)}px in 2s`);

    // Infinite loop: pressing "previous" from the first project wraps round to the last.
    await page.evaluate(() => {
      const t = document.querySelector("[data-testid=build-carousel-track]");
      const first = t.querySelector("[data-testid=build-project-mod-01]");
      t.scrollLeft = first.offsetLeft - (t.clientWidth - first.offsetWidth) / 2;
      t.dispatchEvent(new Event("scroll"));
    });
    await page.waitForTimeout(300);
    for (let k = 0; k < 2; k++) {
      await page.click("[data-testid=carousel-prev]");
      await page.waitForTimeout(800);
    }
    const counter = await page.textContent("[data-testid=build-carousel] p");
    check("carousel loops past the first project", /^0[78] \/ 08/.test(counter.trim()), `counter "${counter.trim().slice(0, 30)}"`);
    await page.screenshot({ path: `${OUT}/${vp.name}-21-carousel-loop.png` });

    // Hero: the name sits above the photo, fits the screen, and they don't overlap.
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1800);
    const hero = await page.evaluate(() => {
      // measure the actual letters (text ranges), not the heading box, which can be narrower than its text
      const ink = (el) => {
        const range = document.createRange();
        range.selectNodeContents(el);
        return range.getBoundingClientRect();
      };
      const name = ink(document.querySelector("[data-testid=hero-title-name]"));
      const os = ink(document.querySelector("[data-testid=hero-title-os]"));
      const clip = document.querySelector("[data-testid=hero-title]").parentElement.getBoundingClientRect();
      const p = document.querySelector("[data-testid=hero-photo]").getBoundingClientRect();
      return {
        textL: Math.round(Math.min(name.left, os.left)), textR: Math.round(Math.max(name.right, os.right)),
        textB: Math.round(Math.max(name.bottom, os.bottom)), clipL: Math.round(clip.left), clipR: Math.round(clip.right),
        nameOsOverlap: !(name.right <= os.left + 1 || name.bottom <= os.top + 1),
        pt: Math.round(p.top), pl: Math.round(p.left), pr: Math.round(p.right), vw: innerWidth,
      };
    });
    check("hero name above photo, no overlap", hero.textB <= hero.pt, JSON.stringify(hero));
    check("hero name not cut off", hero.textL >= hero.clipL - 1 && hero.textR <= hero.clipR + 1 && hero.textR <= hero.vw, `text ${hero.textL}-${hero.textR}, visible ${hero.clipL}-${hero.clipR}`);
    check("SIDDHARTH and .OS don't collide", !hero.nameOsOverlap);
    const photoCentre = (hero.pl + hero.pr) / 2;
    check("hero photo centred", Math.abs(photoCentre - hero.vw / 2) < 24, `centre ${Math.round(photoCentre)} of ${hero.vw}`);
    // the photo is the main thing on the hero: ~90% of a phone's width, ~2/3 of a desktop's height
    const photoW = hero.pr - hero.pl;
    const bigEnough = vp.viewport.width < 640 ? photoW >= 0.85 * vp.viewport.width : photoW >= 0.6 * vp.viewport.height;
    check("hero photo is large", bigEnough, `${photoW}px wide on ${vp.viewport.width}x${vp.viewport.height}`);
    // hero blocks stack top to bottom without touching
    const stack = await page.evaluate(() => {
      const ids = ["hero-title", "hero-photo", "hero-human-exe-line", "hero-tagline", "hero-process-panel", "hero-scroll-cue"];
      return ids.map((id) => {
        let el = document.querySelector(`[data-testid=${id}]`);
        if (id === "hero-title") el = el.parentElement;
        const r = el.getBoundingClientRect();
        return { id, t: Math.round(r.top), b: Math.round(r.bottom) };
      });
    });
    const clash = stack.slice(1).filter((s, i) => s.t < stack[i].b);
    check("hero blocks don't overlap", clash.length === 0, stack.map((s) => `${s.id} ${s.t}-${s.b}`).join(", "));
    // floating tech labels never draw over hero text or the photo (sampled over 3 s, at two scroll positions)
    let worst = 0;
    let zones = 0;
    for (const y of [0, Math.round(vp.viewport.height * 0.35)]) {
      await page.evaluate((yy) => window.scrollTo(0, yy), y);
      for (let k = 0; k < 6; k++) {
        await page.waitForTimeout(250);
        const d = await page.evaluate(() => {
          const c = document.querySelector("[data-testid=particle-field-canvas]");
          return { z: +c.dataset.zones || 0, o: +c.dataset.overlaps || 0 };
        });
        zones = Math.max(zones, d.z);
        worst = Math.max(worst, d.o);
      }
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(600);
    check("floating labels stay clear of hero text and photo", zones >= 3 && worst === 0, `${zones} zones, ${worst} overlaps`);
    await page.screenshot({ path: `${OUT}/${vp.name}-00-hero.png` });
    // where the first section slides over the hero: the two shades should differ
    const shades = await page.evaluate(async () => {
      const about = document.querySelector("[data-testid=hero-section]").nextElementSibling;
      window.scrollTo(0, about.getBoundingClientRect().top + window.scrollY - innerHeight * 0.55);
      await new Promise((r) => setTimeout(r, 900));
      return {
        hero: getComputedStyle(document.querySelector("[data-testid=hero-backdrop]")).backgroundImage.slice(0, 60),
        sheet: getComputedStyle(about).backgroundColor,
        page: getComputedStyle(document.body).backgroundColor,
      };
    });
    check("hero shade differs from the next section", /gradient/.test(shades.hero) && shades.sheet !== shades.page, `hero ${shades.page} -> next ${shades.sheet}`);
    // every section sheet differs in colour from the one before it (and the first from the hero)
    const tones = await page.evaluate(() => {
      const bg = (el) => getComputedStyle(el).backgroundColor;
      const sheets = [...document.querySelectorAll("main > [data-tone]")];
      const seq = [bg(document.body), ...sheets.map(bg)];
      const same = seq.findIndex((c, i) => i > 0 && c === seq[i - 1]);
      return { n: sheets.length, same, seq: seq.slice(0, 5).join(" | ") };
    });
    check("each section has its own shade", tones.n >= 10 && tones.same === -1, `${tones.n} sheets; ${tones.seq}`);
    // the old neon green must be gone from text, backgrounds and borders
    const green = await page.evaluate(() => {
      const hits = new Set();
      for (const el of document.querySelectorAll("body *")) {
        const cs = getComputedStyle(el);
        for (const p of ["color", "backgroundColor", "borderTopColor", "fill", "stroke"]) {
          if (/rgba?\(34, 197, 94/.test(cs[p])) hits.add(`${el.tagName.toLowerCase()}.${p}`);
        }
      }
      return [...hits];
    });
    check("no neon green left", green.length === 0, green.slice(0, 5).join(", "));
    await page.screenshot({ path: `${OUT}/${vp.name}-00b-hero-to-next.png` });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);

    const hiddenPending = await page.evaluate(() => document.body.innerText.includes("Not documented"));
    if (hiddenPending) failures++;
    report.push(`${vp.name} | "Not documented" placeholders hidden | ${hiddenPending ? "FAIL" : "OK"}`);
    // Sideways sliders keep their slide but show no scrollbar
    const bars = await page.evaluate(() =>
      ["build-carousel-track", "timeline-scroll"].map((id) => {
        const el = document.querySelector(`[data-testid=${id}]`);
        return el ? `${id}:${el.offsetHeight - el.clientHeight}px` : `${id}:missing`;
      })
    );
    check("sliders have no visible scrollbar", bars.every((b) => b.endsWith(":0px")), bars.join(" "));
    // The photo is the cut-out PNG with its outline
    const photo = await page.evaluate(() => {
      const img = document.querySelector("[data-testid=avatar-grain-image], [data-testid=hero-avatar-static]");
      return img ? { src: img.currentSrc || img.src, filter: getComputedStyle(img).filter } : null;
    });
    check("photo background removed, outline on", !!photo && /avatar-cutout/.test(photo.src) && /drop-shadow/.test(photo.filter), photo ? photo.src.split("/").pop() : "no photo");
    // Sideways overflow: the page itself shifted, or any visible element sticking out past the screen
    // (ignoring elements inside containers that are meant to scroll or clip sideways).
    const overflow = await page.evaluate(() => {
      const vw = window.innerWidth;
      const shifted = window.scrollX || document.documentElement.scrollLeft || document.body.scrollLeft;
      const clipped = (el) => {
        for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
          const s = getComputedStyle(p);
          if (/(auto|scroll|hidden|clip)/.test(s.overflowX)) {
            const r = p.getBoundingClientRect();
            if (r.right <= vw + 1) return true;
          }
        }
        return false;
      };
      const wide = [];
      for (const el of document.querySelectorAll("body *")) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        const cs = getComputedStyle(el);
        if (cs.position === "fixed" && r.left >= 0 && r.right <= vw + 1) continue;
        // decorative fixed layers (e.g. film grain) are oversized on purpose and can't be scrolled to
        if (cs.position === "fixed" && el.getAttribute("aria-hidden") === "true") continue;
        if (r.right > vw + 2 && !clipped(el)) wide.push(`${el.tagName.toLowerCase()}.${String(el.className).split(" ")[0]}(${Math.round(r.right)}px)`);
        if (wide.length > 5) break;
      }
      return { shifted, wide };
    });
    const overflowBad = overflow.shifted > 0 || overflow.wide.length > 0;
    if (overflowBad) failures++;
    report.push(
      `${vp.name} | sideways overflow | ${overflowBad ? `FAIL scrollX=${overflow.shifted} ${overflow.wide.join(", ")}` : "none"}`
    );

    report.push(`${vp.name} | errors | ${errors.length ? errors.slice(0, 8).join(" ;; ") : "none"}`);
    if (errors.length) failures++;
    await ctx.close();
  }

  await browser.close();
  fs.writeFileSync("smoke-report.txt", report.join("\n") + "\n");
  console.log(report.join("\n"));
  process.exit(failures ? 1 : 0);
})().catch((e) => {
  console.error(e);
  fs.writeFileSync("smoke-report.txt", `CRASH: ${e.stack || e}\n`);
  process.exit(1);
});
