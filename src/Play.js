import puppeteer from 'puppeteer'
import locate from './util/Locate.js';
import click_on from './util/ClickOn.js';
import pkg from 'ghost-cursor';
const { installMouseHelper } = pkg;
import { createCursor } from 'ghost-cursor';
import Fakerator from 'fakerator';

const fakerator = Fakerator();

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const context = browser.defaultBrowserContext();
    context.overridePermissions("https://www.reddit.com", ["geolocation", "notifications"]);
    const page = await browser.newPage();
    installMouseHelper(page);
    const cursor = createCursor(page)
    await page.goto('https://google.com');

    await click_on('sign in', page, cursor)
    await page.waitForNavigation({waitUntil: 'networkidle2'})
    await click_on('create account', page, cursor)
    await page.waitFor(200);
    await click_on('for myself', page, cursor);
    const fake_user = fakerator.entity.user('M');
    await page.waitForNavigation({waitUntil: 'networkidle2'})
    await click_on('first name', page, cursor)

    console.log(fake_user)
    
    // console.log('Dimensions:', dimensions);

    // await browser.close();
})();