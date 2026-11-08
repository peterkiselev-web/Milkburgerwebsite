// Renders the logo SVG at 2x with flat marker colours (red letter bodies, blue outlines)
// so extract.py can separate the letters. Usage: node render-logo.cjs logo.svg out.png
const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const svg = fs.readFileSync(process.argv[2], 'utf8');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 4800, height: 900 } });
  await page.setContent(
    `<html><body style="margin:0;background:#fff"><div style="width:4704px;padding:40px;--logo-fill:#ff0000;--logo-ink:#0000ff">${svg}</div></body></html>`,
  );
  await page.screenshot({ path: process.argv[3], fullPage: true });
  await browser.close();
})();
