// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
const puppeteerextra = require('puppeteer-extra')

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteerextra.use(StealthPlugin())


const puppeteer = require("puppeteer");
require("dotenv").config();
const fs = require('fs');


const bot = async (res) => {

  const PUPPETEER_HEADLESS = process.env.PUPPETEER_HEADLESS === "TRUE"?true:false

  const option = {
    headless: PUPPETEER_HEADLESS,
    //headless: true,
    slowMo: 250,
    //devtools: true,
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
    await page.goto('https://bot.sannysoft.com')
    //await page.goto('https://arh.antoinevastel.com/bots/areyouheadless')
    await page.waitForTimeout(15000)
    await page.screenshot({ path: './public/result.png', fullPage: true })
    await browser.close()
    console.log(`All done, check the screenshot. ?`)


    res.send('done');
  } catch (e) {
    console.error(e);
    res.send(`Something went wrong while running Puppeteer: ${e}`);
    
  } finally {
    await browser.close();
  }
};

module.exports = { bot };
