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
    const hiddenPending = await page.evaluate(() => document.body.innerText.includes("Not documented"));
    if (hiddenPending) failures++;
    report.push(`${vp.name} | "Not documented" placeholders hidden | ${hiddenPending ? "FAIL" : "OK"}`);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    report.push(`${vp.name} | horizontal overflow | ${overflow > 1 ? overflow + "px" : "none"}`);

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
