const puppeteer = require("puppeteer");
require("dotenv").config();
const fs = require('fs');


const postPhoto = async (res) => {
  const browser = await puppeteer.launch({
    headless: false,
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
  });
  try {
    const page = (await browser.pages())[0]
    
    //url login
    const url_login = 'https://www.instagram.com/accounts/login/'
    
    //url login api
    const url_login_api = 'https://www.instagram.com/api/v1/web/accounts/login/ajax/'
    
    //cokies path
    const cookiesPath = "cookies.txt"
    
    //default status
    let status = 'anauth'
   
    //pageres
    let pageres = []

    // Set screen size
    //await page.setViewport({ width: 1080, height: 1024, deviceScaleFactor: 0.5 })
    
    //write cokies
    async function writecookies() {
      const cookiesObject = await page.cookies()
      fs.writeFileSync(cookiesPath, JSON.stringify(cookiesObject));
      console.log('Session has been saved to ' + cookiesPath);
    }
    
    //read cookies
    async function readcookies() {
        const previousSession = fs.existsSync(cookiesPath)
        if (previousSession) {
          const content = fs.readFileSync(cookiesPath);
          const cookiesArr = JSON.parse(content);
          if (cookiesArr.length !== 0) {
            for (let cookie of cookiesArr) {
              await page.setCookie(cookie)
            }
            console.log('Session has been loaded in the browser')
          }
        }
    }
    
    //load cookies
    await readcookies()

    const onResponse = async (response) => {
        
        pageres.push(response)
        
        if (response.status() == 302 && response.url() == url_login) {
            status = 'auth'
        }
        if (response.url().split("?")[0] == url_login_api) {
            const responseJSON = await response.json();

            if (responseJSON.authenticated) {
                status = 'auth'
                await writecookies()
            } else {
                status = 'anauth'
            }
        }
    }
    
    //on response
    page.on("response", onResponse)

    //open login page
    //await page.goto(url_login)
        await page.goto(url_login, {
            waitUntil: 'networkidle0',
            timeout: 0,
        });
    
    await page.waitForNavigation()
    
    await page.locator('input[name=username]').wait()


    res.send(pageres);
  } catch (e) {
    console.error(e);
    res.send(`Something went wrong while running Puppeteer: ${e}`);
  } finally {
    await browser.close();
  }
};

module.exports = { postPhoto };
