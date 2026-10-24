// Run after frontend build and cargo build; Playwright is a QA tool supplied by the runner.
const { chromium } = require("playwright");
const { spawn } = require("node:child_process");
const { once } = require("node:events");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const net = require("node:net");

const pilot = path.resolve(__dirname, "..");
const output = process.env.PILOT_QA_OUTPUT || __dirname;
fs.mkdirSync(output, { recursive: true });
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function startApi() {
  const env = { ...process.env, PILOT_BIND: "127.0.0.1:9180" };
  delete env.DATABASE_URL; // This test must never use a caller's real database.
  return spawn(path.join(pilot, "backend/target/debug/vspportfolio-solid-axum-pilot"), [], {
    env: { ...env, RUST_LOG: "info" }, stdio: ["ignore", "pipe", "pipe"]
  });
}

async function stop(child) {
  if (!child || child.exitCode !== null) return;
  const exited = once(child, "exit");
  child.kill("SIGINT");
  const timer = setTimeout(() => child.kill("SIGKILL"), 3000);
  try { await exited; } finally { clearTimeout(timer); }
}

async function checkPorts() {
  for (const port of [9180, 5178]) {
    const server = net.createServer();
    await new Promise((resolve, reject) => {
      server.once("error", () => reject(Error("Test port already occupied: " + port)));
      server.listen(port, "127.0.0.1", resolve);
    });
    await new Promise(resolve => server.close(resolve));
  }
}

async function ownServerReady(child, marker) {
  child.stderr.resume();
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => done(Error("Owned test server startup timed out")), 10000);
    function done(error) {
      clearTimeout(timer);
      child.off("exit", onExit);
      child.off("error", onError);
      child.stdout.off("data", onData);
      if (error) reject(error); else resolve();
    }
    const onExit = code => done(Error("Owned test server exited during startup: " + code));
    const onError = error => done(error);
    const onData = chunk => { if (chunk.toString().includes(marker)) done(); };
    child.once("exit", onExit);
    child.once("error", onError);
    child.stdout.on("data", onData);
  });
  child.stdout.resume();
}

async function waitHttp(url, child) {
  for (let i = 0; i < 50; i++) {
    if (child.exitCode !== null) throw Error("Owned test server exited");
    try { if ((await fetch(url, { signal: AbortSignal.timeout(500) })).ok) return; } catch {}
    await delay(100);
  }
  throw Error("Local test server did not start: " + url);
}

(async () => {
  let api, vite, browser;
  const results = [];
  try {
    await checkPorts();
    api = startApi();
    await ownServerReady(api, "isolated migration pilot listening");
    await waitHttp("http://127.0.0.1:9180/api/migration/health", api);
    vite = spawn(process.execPath, ["node_modules/vite/bin/vite.js", "preview", "--host", "127.0.0.1", "--port", "5178", "--strictPort"], {
      cwd: path.join(pilot, "frontend"), stdio: ["ignore", "pipe", "pipe"]
    });
    await ownServerReady(vite, "Local:");
    await waitHttp("http://127.0.0.1:5178/", vite);
    browser = await chromium.launch({
      headless: true,
      ...(process.env.PILOT_BROWSER_EXECUTABLE ? { executablePath: process.env.PILOT_BROWSER_EXECUTABLE } : {})
    });
    const page = await browser.newPage({ viewport: { width: 375, height: 850 } });
    const pageErrors = [];
    page.on("pageerror", e => pageErrors.push(e.message));
    await page.goto("http://127.0.0.1:5178/");
    const statuses = page.locator("article strong");
    async function expectStatuses(expected) {
      await page.waitForFunction(values =>
        JSON.stringify([...document.querySelectorAll("article strong")].map(n => n.textContent.trim())) === JSON.stringify(values), expected);
      assert.deepEqual(await statuses.allTextContents(), expected);
    }
    await expectStatuses(["Доступний", "Недоступний"]);
    results.push("actual Axum health 200 and no-database readiness 503 visible");

    for (const width of [320, 375, 768, 1280]) {
      await page.setViewportSize({ width, height: 850 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    }
    await page.screenshot({ path: path.join(output, "pilot-desktop.png"), fullPage: true });
    results.push("320/375/768/1280px: no horizontal overflow");

    await page.getByRole("button", { name: "EN", exact: true }).focus();
    await page.keyboard.press("Enter");
    assert.equal(await page.locator("html").getAttribute("lang"), "en");
    assert.equal(await page.getByRole("button", { name: "EN", exact: true }).getAttribute("aria-pressed"), "true");
    await expectStatuses(["Available", "Unavailable"]);
    results.push("keyboard language toggle and document lang synchronized");

    await stop(api);
    api = undefined;
    await page.getByRole("button", { name: "Check again", exact: true }).click();
    await expectStatuses(["Unavailable", "Unavailable"]);
    assert.equal(await page.getByRole("heading", { level: 1 }).count(), 1);
    assert.equal(await page.getByRole("button", { name: "Check again", exact: true }).isEnabled(), true);
    results.push("API outage: unavailable UI remains usable, no uncaught resource exception");

    api = startApi();
    await ownServerReady(api, "isolated migration pilot listening");
    await waitHttp("http://127.0.0.1:9180/api/migration/health", api);
    await page.getByRole("button", { name: "Check again", exact: true }).click();
    await expectStatuses(["Available", "Unavailable"]);
    results.push("API restart and retry recover actual health");

    await page.context().setOffline(true);
    await page.getByRole("button", { name: "Check again", exact: true }).click();
    await expectStatuses(["Unavailable", "Unavailable"]);
    await page.context().setOffline(false);
    await page.getByRole("button", { name: "Check again", exact: true }).click();
    await expectStatuses(["Available", "Unavailable"]);
    results.push("browser offline/online retry recovers");

    // A controlled HTTP transport delay tests the browser timeout, not PostgreSQL.
    await page.route("**/api/migration/**", async route => {
      await delay(3000);
      try { await route.abort("timedout"); } catch {}
    });
    const started = Date.now();
    await page.getByRole("button", { name: "Check again", exact: true }).click();
    await expectStatuses(["Unavailable", "Unavailable"]);
    assert.ok(Date.now() - started < 4000);
    await page.unrouteAll({ behavior: "wait" });
    results.push("controlled transport delay: 2.5s browser timeout fails closed");
    await page.getByRole("button", { name: "УК", exact: true }).click();
    await page.setViewportSize({ width: 375, height: 850 });
    await page.screenshot({ path: path.join(output, "pilot-mobile-outage.png"), fullPage: true });
    assert.deepEqual(pageErrors, []);
    console.log(JSON.stringify({ browser: await browser.version(), results, pageErrors }, null, 2));
  } finally {
    try { if (browser) await browser.close(); }
    finally { try { await stop(vite); } finally { await stop(api); } }
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
