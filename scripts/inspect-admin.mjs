import { chromium } from "playwright";

function nowIsoSafe() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function toSummaryUrl(u) {
  try {
    const url = new URL(u);
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return String(u);
  }
}

async function tryFill(page, selectors, value) {
  for (const sel of selectors) {
    const loc = page.locator(sel).first();
    if (await loc.count()) {
      try {
        await loc.fill(value, { timeout: 1500 });
        return { selector: sel, ok: true };
      } catch {}
    }
  }
  return { selector: null, ok: false };
}

async function tryClick(page, selectors) {
  for (const sel of selectors) {
    const loc = page.locator(sel).first();
    if (await loc.count()) {
      try {
        await loc.click({ timeout: 2000 });
        return { selector: sel, ok: true };
      } catch {}
    }
  }
  return { selector: null, ok: false };
}

async function main() {
  const base = "http://localhost:3000";
  const startUrl = `${base}/html/admin/index.html`;
  const aboutCompanyUrl = `${base}/html/admin/about-company.html`;
  const outDir = "artifacts";
  const stamp = nowIsoSafe();

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const consoleMessages = [];
  const pageErrors = [];
  const requestFailures = [];
  const badResponses = [];
  const redirects = [];

  page.on("console", (msg) => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text(),
      location: msg.location(),
    });
  });
  page.on("pageerror", (err) => {
    pageErrors.push({ message: String(err), stack: err?.stack });
  });
  page.on("requestfailed", (req) => {
    requestFailures.push({
      url: req.url(),
      method: req.method(),
      resourceType: req.resourceType(),
      failure: req.failure(),
    });
  });
  page.on("response", (res) => {
    const req = res.request();
    const status = res.status();
    if (status >= 400) {
      badResponses.push({
        url: res.url(),
        status,
        statusText: res.statusText(),
        method: req.method(),
        resourceType: req.resourceType(),
      });
    }
  });
  page.on("framenavigated", (frame) => {
    if (frame === page.mainFrame()) {
      redirects.push({ url: frame.url(), ts: Date.now() });
    }
  });

  const mkdir = await import("node:fs/promises").then((m) => m.mkdir);
  const writeFile = await import("node:fs/promises").then((m) => m.writeFile);
  await mkdir(outDir, { recursive: true });

  const run = {
    startedAt: new Date().toISOString(),
    startUrl,
    attemptedLogin: { username: "admin", password: "admin123" },
    steps: [],
    final: {},
  };

  // Step 1: open start page
  run.steps.push({ action: "goto", url: startUrl });
  const resp1 = await page.goto(startUrl, { waitUntil: "domcontentloaded" });
  run.steps[run.steps.length - 1].response = resp1
    ? { url: resp1.url(), status: resp1.status(), statusText: resp1.statusText() }
    : null;

  // Attempt login if form is present
  const usernameSelectors = [
    'input[name="username"]',
    'input[name="user"]',
    'input[name="email"]',
    'input[type="email"]',
    'input[type="text"]',
    "#username",
    "#user",
    "#email",
    '[placeholder*="user" i]',
    '[placeholder*="email" i]',
    '[placeholder*="账户" i]',
    '[placeholder*="用户名" i]',
  ];
  const passwordSelectors = [
    'input[name="password"]',
    'input[type="password"]',
    "#password",
    '[placeholder*="pass" i]',
    '[placeholder*="密码" i]',
  ];
  const submitSelectors = [
    'button[type="submit"]',
    'input[type="submit"]',
    'button:has-text("Login")',
    'button:has-text("Sign in")',
    'button:has-text("登录")',
    'button:has-text("登陆")',
    'button:has-text("提交")',
    'button:has-text("确定")',
  ];

  const filledUser = await tryFill(page, usernameSelectors, "admin");
  const filledPass = await tryFill(page, passwordSelectors, "admin123");
  run.steps.push({ action: "fill", field: "username", ...filledUser });
  run.steps.push({ action: "fill", field: "password", ...filledPass });

  if (filledUser.ok || filledPass.ok) {
    // If we managed to fill at least one field, try to submit.
    const clicked = await tryClick(page, submitSelectors);
    run.steps.push({ action: "click", target: "submit", ...clicked });
    // Wait a bit for any navigation/xhr-driven login UI updates.
    try {
      await page.waitForLoadState("networkidle", { timeout: 6000 });
    } catch {
      // ignore
    }
  } else {
    run.steps.push({ action: "login", note: "No obvious login fields found; skipping submit." });
  }

  // Step 2: navigate to about-company
  run.steps.push({ action: "goto", url: aboutCompanyUrl });
  const resp2 = await page.goto(aboutCompanyUrl, { waitUntil: "domcontentloaded" });
  run.steps[run.steps.length - 1].response = resp2
    ? { url: resp2.url(), status: resp2.status(), statusText: resp2.statusText() }
    : null;

  // Wait for page settle
  try {
    await page.waitForLoadState("networkidle", { timeout: 8000 });
  } catch {
    // ignore
  }

  const finalUrl = page.url();
  const title = await page.title().catch(() => null);
  const contentSnippet = await page
    .locator("body")
    .innerText()
    .then((t) => String(t).trim().slice(0, 800))
    .catch(() => null);

  const screenshotPath = `${outDir}/about-company-${stamp}.png`;
  let screenshotSaved = false;
  try {
    await page.screenshot({ path: screenshotPath, fullPage: true });
    screenshotSaved = true;
  } catch {
    // ignore
  }

  run.final = {
    finalUrl,
    finalUrlNoHashQuery: toSummaryUrl(finalUrl),
    title,
    bodyTextSnippet: contentSnippet,
    screenshotPath: screenshotSaved ? screenshotPath : null,
    redirectChain: redirects.map((r) => r.url),
    console: {
      counts: consoleMessages.reduce((acc, m) => {
        acc[m.type] = (acc[m.type] || 0) + 1;
        return acc;
      }, {}),
      messages: consoleMessages.slice(-200),
    },
    pageErrors,
    network: {
      requestFailures,
      badResponses,
    },
  };

  const reportPath = `${outDir}/about-company-report-${stamp}.json`;
  await writeFile(reportPath, JSON.stringify(run, null, 2), "utf8");

  await context.close();
  await browser.close();

  // Minimal stdout summary (so the caller can quickly read results)
  console.log(JSON.stringify({ reportPath, screenshotPath: run.final.screenshotPath, finalUrl: run.final.finalUrl }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
