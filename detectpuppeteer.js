// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
const puppeteerextra = require('puppeteer-extra')

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteerextra.use(StealthPlugin())


const puppeteer = require("puppeteer");
require("dotenv").config();
const fs = require('fs');


const detectpuppeteer = async (res) => {

  const PUPPETEER_HEADLESS = process.env.PUPPETEER_HEADLESS === "TRUE"?true:false

  const option = {
    //headless: PUPPETEER_HEADLESS,
    headless: false,
    slowMo: 250,
    devtools: true,
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote",
      "--disable-features=site-per-process"
    ],
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
  }
  
  let browser;
  
  if (option.headless){
    browser = await puppeteerextra.launch(option);
  }else{
    browser = await puppeteer.launch(option);
  }
  
  
  try {
  
    console.log('Running tests..')
    const page = await browser.newPage()
    await page.goto('https://nuzulul.github.io/app/detectpuppeteer/')
    await page.waitForTimeout(5000)
    await page.type('#text-field', 'hi');
    await page.waitForTimeout(5000)
    await page.screenshot({ path: 'detectpuppeter.png', fullPage: true })
    await browser.close()
    console.log(`All done, check the screenshot. ?`)
    await page.waitForTimeout(5000)

    res.send('done');
  } catch (e) {
    console.error(e);
    res.send(`Something went wrong while running Puppeteer: ${e}`);
    
  } finally {
    await browser.close();
  }
};

module.exports = { detectpuppeteer };
