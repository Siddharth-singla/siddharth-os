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

    await page.goto(URL, { waitUntil: "networkidle" });
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
    const firstLog = (await page.textContent("[data-testid=voice-dock-log]").catch(() => "")) || "";
    const aiOk = /AI MEETING ASSISTANT/.test(firstLog);
    if (!aiOk) failures++;
    report.push(`${vp.name} | boot command "show me his AI work" | ${aiOk ? "OK" : "FAIL"}`);

    let n = 3;
    for (const [cmd, label, expect] of COMMANDS) {
      await page.fill("[data-testid=voice-dock-input]", cmd);
      await page.press("[data-testid=voice-dock-input]", "Enter");
      await page.waitForTimeout(4200);
      const log = (await page.textContent("[data-testid=voice-dock-log]").catch(() => "")) || "";
      const ok = log.includes(expect);
      if (!ok) failures++;
      const y = await page.evaluate(() => Math.round(window.scrollY));
      report.push(`${vp.name} | "${cmd}" | ${ok ? "OK" : "FAIL (expected " + expect + ")"} | scrollY=${y}`);
      // close the console so it doesn't cover the screenshot, then reopen for the next command
      await page.click("[data-testid=voice-dock-close-button]").catch(() => {});
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${OUT}/${vp.name}-${String(n++).padStart(2, "0")}-${label}.png` });
      await page.click("[data-testid=voice-dock-button]").catch(() => {});
      await page.waitForTimeout(400);
    }

    const clock = await page.textContent("[data-testid=play-match-clock]").catch(() => "?");
    report.push(`${vp.name} | match clock | ${clock}`);
    // A project card you jump to must not be dimmed.
    await page.fill("[data-testid=voice-dock-input]", "tell me about savoury");
    await page.press("[data-testid=voice-dock-input]", "Enter");
    await page.waitForTimeout(4200);
    const cardOpacity = await page.evaluate(() => {
      const el = document.querySelector("[data-testid=build-project-mod-07] > div");
      return el ? Number(getComputedStyle(el).opacity) : -1;
    });
    const cardOk = cardOpacity > 0.95;
    if (!cardOk) failures++;
    report.push(`${vp.name} | jumped-to card at full brightness | ${cardOk ? "OK" : "FAIL"} (opacity ${cardOpacity})`);

    const hiddenPending = await page.evaluate(() => document.body.innerText.includes("Not documented"));
    if (hiddenPending) failures++;
    report.push(`${vp.name} | "Not documented" placeholders hidden | ${hiddenPending ? "FAIL" : "OK"}`);
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
