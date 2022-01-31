import puppeteer from 'puppeteer'
import locate from './util/Locate.js';
import click_on from './util/ClickOn.js';
import pkg from 'ghost-cursor';
const { installMouseHelper } = pkg;
import { createCursor } from 'ghost-cursor';
import Fakerator from 'fakerator';
import keyboard from './util/Keyboard.js';
import { generate } from 'generate-password';

const fakerator = Fakerator();

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const context = browser.defaultBrowserContext();
    context.overridePermissions("https://www.reddit.com", ["geolocation", "notifications"]);
    const page = await browser.newPage();
    const cursor = createCursor(page)
    installMouseHelper(page);
    await page.goto('https://google.com');

    await click_on('search', page, cursor);
    await keyboard('outlook email', page)
    await page.keyboard.press("Enter")
    await page.waitForNavigation({waitUntil: 'networkidle2'});
    await click_on('Outlook free personal email and calendar from Microsoft', page, cursor);
    await page.waitForNavigation({waitUntil: 'networkidle2'});
    await click_on('create free account', page, cursor);


    const fake_user = fakerator.entity.user('M');
    fake_user.userName = `${fake_user.firstName}${fake_user.lastName}${Math.floor(Math.random() * 999999)}`.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
    fake_user.password = generate({ numbers: true, length: 15 })

    await page.waitForNavigation({waitUntil: 'networkidle2'});
    await click_on('new email', page, cursor);
    await keyboard(fake_user.userName, page)
    await click_on('next', page, cursor)

    // await page.waitForNavigation({waitUntil: 'networkidle2'});
    await page.waitForTimeout(500)
    await click_on('create password', page, cursor);
    await keyboard(fake_user.password, page)
    await click_on('next', page, cursor)

    // await page.waitForNavigation({waitUntil: 'networkidle2'});
    // await installMouseHelper(page);
    // await click_on('first name', page, cursor);
    // await keyboard(fake_user.firstName, page);
    // await click_on('last name', page, cursor);
    // await keyboard(fake_user.lastName, page);
    // await click_on('username', page, cursor);
    // await keyboard(fake_user.userName, page)
    // await click_on('password', page, cursor);
    // await keyboard(fake_user.password, page)
    // await click_on('confirm', page, cursor);
    // await keyboard(fake_user.password, page);
    // await click_on('next', page, cursor)


    console.log(fake_user)
    
    // console.log('Dimensions:', dimensions);

    // await browser.close();
})();