import assert from "node:assert/strict";
import { chromium } from "playwright";

const baseUrl = process.env.CONSULTATION_QA_BASE_URL ?? "http://localhost:3109";

const widths = [360, 390, 430] as const;

async function main() {
  const browser = await chromium.launch({ headless: true });
  const results: unknown[] = [];

  try {
  for (const width of widths) {
    const context = await browser.newContext({ viewport: { height: 900, width } });
    const page = await context.newPage();
    const consoleErrors: string[] = [];
    const blockedAnalytics: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") {
        const text = message.text();
        if (text.includes("403") || text.includes("Forbidden")) {
          blockedAnalytics.push(text);
        } else {
          consoleErrors.push(text);
        }
      }
    });
    page.on("response", (resourceResponse) => {
      if (resourceResponse.status() === 403 && resourceResponse.url().includes("/api/analytics/event")) {
        blockedAnalytics.push(resourceResponse.url());
      }
    });

    const response = await page.goto(`${baseUrl}/consultation`, {
      timeout: 45_000,
      waitUntil: "domcontentloaded",
    });
    await page.waitForTimeout(1_200);

    const state = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        clientWidth: document.documentElement.clientWidth,
        hasBook: /\bBook\b/.test(text),
        hasRawWhatsapp: text.includes(`+${"91"}${"9085"}${"946882"}`),
        hasResidentialVastu: text.includes("Residential Vastu"),
        hasUnavailableCopy: text.includes("Consultation requests are closed at present."),
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        scrollWidth: document.documentElement.scrollWidth,
      };
    });

    assert.equal(response?.status(), 200, `/consultation ${width} status`);
    assert.equal(state.hasUnavailableCopy, true, `/consultation ${width} unavailable copy`);
    assert.equal(state.hasBook, false, `/consultation ${width} no public booking CTA`);
    assert.equal(state.hasResidentialVastu, false, `/consultation ${width} no draft utility`);
    assert.equal(state.hasRawWhatsapp, false, `/consultation ${width} no raw WhatsApp`);
    assert.equal(state.overflow, false, `/consultation ${width} no overflow`);
    assert.deepEqual(consoleErrors, [], `/consultation ${width} console errors`);
    results.push({
      width,
      status: response?.status(),
      ...state,
      consoleErrors: consoleErrors.length,
      knownAnalytics403: blockedAnalytics.length > 0,
    });

    await context.close();
  }

  if (process.env.CONSULTATION_QA_ADMIN_ROUTE === "1") {
    const context = await browser.newContext({ viewport: { height: 900, width: 390 } });
    const page = await context.newPage();
    const response = await page.goto(`${baseUrl}/admin/consultation-preview`, {
      timeout: 45_000,
      waitUntil: "domcontentloaded",
    });
    await page.waitForTimeout(800);
    const adminState = await page.evaluate(() => ({
      hasLogin: document.body.innerText.includes("Admin sign in"),
      path: location.pathname,
    }));
    assert.equal(response?.status(), 200, "unauthenticated Admin preview returns login shell safely");
    assert.equal(adminState.hasLogin, true, "unauthenticated Admin preview shows login shell");
    results.push({ adminPreviewUnauthenticated: { status: response?.status(), ...adminState } });
    await context.close();
  } else {
    results.push({ adminPreviewUnauthenticated: "covered by source guard QA and npm run debug:admin:auth:qa" });
  }
  } finally {
    await browser.close();
  }

  console.log(JSON.stringify(results, null, 2));
  console.log("\nconsultation frontend responsive QA passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
