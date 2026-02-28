import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log(`BROWSER ERROR: ${msg.text()}`);
        } else if (msg.type() === 'warning') {
            console.log(`BROWSER WARNING: ${msg.text()}`);
        }
    });

    page.on('pageerror', err => {
        console.log(`PAGE EXCEPTION: ${err.message}`);
        console.log(`STACK: ${err.stack}`);
    });

    try {
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 10000 });
        await page.waitForTimeout(2000); // give it time to crash
        console.log("Successfully loaded page, checking for console errors...");
    } catch (e) {
        console.log(`NAVIGATION ERROR: ${e.message}`);
    }

    await browser.close();
})();
