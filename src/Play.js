import puppeteer from 'puppeteer'
import locate from './util/Locate.js';
import pkg from 'ghost-cursor';
const { installMouseHelper } = pkg;


(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const context = browser.defaultBrowserContext();
    context.overridePermissions("https://www.reddit.com", ["geolocation", "notifications"]);
    const page = await browser.newPage();
    installMouseHelper(page);
    await page.goto('https://reddit.com');

    await locate('log in', page)
    // console.log('Dimensions:', dimensions);

    // await browser.close();
})();