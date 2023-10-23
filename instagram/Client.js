'use strict'

// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
const puppeteerextra = require('puppeteer-extra')

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteerextra.use(StealthPlugin())

const puppeteernormal = require('puppeteer');
const ClientEvent = require('./structures/ClientEvent');
const { URLS, DEFAULT_PUPPETEER_OPTIONS, DEFAULT_USER_AGENT, STATUS, ALLOWED_MEDIA_MIMETYPES, MAX_FEED_VIDEO_DURATION_IN_SECONDS } = require("./utilities/Constants");
const Injects = require('./utilities/Injects');
const { getVideoDurationInSeconds } = require('get-video-duration');
const FeedMedia = require('./structures/FeedMedia');

/**
 * Instagram client.
 * @extends {ClientEvent}
 * @param {object} options - Client options.
 * @param {Authentication} options.authentication - Representing instagram authentication and determines how session is saved.
 * @param {object} options.puppeteerOptions - Puppeteer launch options. View docs here: https://github.com/puppeteer/puppeteer/
 * @param {string} options.userAgent -  User agent to use in puppeteer.
 * 
 * @fires Client#authenticated
 * @fires Client#auth_failure
 */
class Client extends ClientEvent {
    constructor(options) {
        super();

        const {
            authentication,
            puppeteerOptions = {},
            userAgent = DEFAULT_USER_AGENT
        } = options;

        this.userAgent = userAgent;
        this.puppeteerOptions = {
            ...DEFAULT_PUPPETEER_OPTIONS,
            ...puppeteerOptions,
        };

        this.authentication = authentication;
        this.authentication.injectClient(this);
    }

    /**
    * Sets up events and requirements, kicks off authentication request
    * @returns {Promise<void>}
    */
    async initialize(command = "launch") {
    
        console.log('cek browser')
        console.log(this.browser)
    
        let pageexists = true
        if(this.browser != undefined){
          console.log('page:'+(await this.browser.pages()).length)
          if(!(await this.browser.pages()).length > 0){
            pageexists = false
          }
        }
    
        if(this.browser == undefined || !pageexists){
          console.log('launch browser')
          this.listen();

          await this.authentication.setupUserDir();
          this.puppeteerOptions.userDataDir = this.authentication.userDataDir;

          console.log('headless: '+this.puppeteerOptions.headless)
          if (this.puppeteerOptions.headless){
              console.log('launch puppeteerextra browser')
              if (this.puppeteerOptions.browserWSEndpoint) {
                  this.browser = await puppeteerextra.connect(this.puppeteerOptions);
              } else {
                  this.browser = await puppeteerextra.launch(this.puppeteerOptions);
              }
          }else{
              console.log('launch puppeteernormal browser')
              if (this.puppeteerOptions.browserWSEndpoint) {
                  this.browser = await puppeteernormal.connect(this.puppeteerOptions);
              } else {
                  this.browser = await puppeteernormal.launch(this.puppeteerOptions);
              }
          }
          
        }
        
        if (command != "login") return true;
        
        this.status = STATUS.UNAUTHENTICATED
        
        if((await this.browser.pages()).length > 0){  
          //this.page = (await this.browser.pages())[0]
          this.page = await this.browser.newPage();
        }else{
          this.page = await this.browser.newPage();
        }
        
        console.log('status1: '+this.status)
        
        await this.authentication.readCookies();
        const cookiesArr = this.authentication.usercookies;
        if (cookiesArr.length !== 0) {
          for (let cookie of cookiesArr) {
            await this.page.setCookie(cookie)
          }
          console.log('Session has been loaded in the browser')
        }

       // store in localstorage the token
        const preloadFn = async () => {
            const sessionStorage = JSON.parse(this.authentication.sessionStorage);
            await this.page.evaluate((data) => {
              for (const [key, value] of Object.entries(data)) {
                sessionStorage[key] = value;
              }
            }, sessionStorage);

            const localStorage = JSON.parse(this.authentication.localStorage);
            await this.page.evaluate((data) => {
              for (const [key, value] of Object.entries(data)) {
                localStorage[key] = value;
              }
            }, localStorage);
        }
        await this.page.evaluateOnNewDocument(preloadFn);
        

                  
        await this.page.setUserAgent(this.userAgent);

        this.page.on("response", this.onPageAuthenticationResponse);

        //await this.page.waitForTimeout(5000);
        console.log('before goto')
        await this.page.goto(URLS.LOGIN, {
            waitUntil: 'networkidle0',
            timeout: 0,
        });
        console.log('after goto')
        
        //await this.page.waitForTimeout(5000);
               
        
        console.log('status2: '+this.status)

        if (this.status === STATUS.AUTHENTICATED) {
            console.log('return')
            return true;
        };
        
        console.log('status3: '+this.status)
        
        try{
          await this.page.type('input[name="username"]', this.authentication.username);
          await this.page.waitForTimeout(2000);
          await this.page.type('input[name="password"]', this.authentication.password);
          await this.page.waitForTimeout(2000);
          //await this.page.click('[type="submit"]');
          console.log('login form')
          //await this.page.waitForNavigation({waitUntil: 'networkidle2'});
          await Promise.all([
            this.page.click('[type="submit"]'),
            this.page.waitForNavigation(),
          ]);
        }catch(e){}
        
        console.log('status4: '+this.status)

        try {
          await this.page.waitForSelector("svg[aria-label='New post']")
          console.log('detect true login');
          this.onClientPosAuthenticated()
          console.log('status5: '+this.status)
          return true;
        } catch(e) {
          console.log('detect login failed')
        }

        try{
            await currentPage.waitForFunction(
              '[...document.querySelectorAll("span")].find(b => b.innerText.toLowerCase().match("dismiss"))',
            );
            console.log('detect suspect automated')            
            // dismiss.
            await currentPage.evaluate(() => {
                [...document.querySelectorAll("span")].find(b => b.innerText.toLowerCase().match("dismiss")).focus();
                [...document.querySelectorAll("span")].find(b => b.innerText.toLowerCase().match("dismiss")).click();
            })
            this.page.waitForNavigation()
            this.onClientPosAuthenticated()
            console.log('detect suspect automated resolve')  
        } catch(e) {
          console.log('dismis suspect automated gagal')  
          if (!this.page.isClosed()) {
              await this.page.close();
          }
          this.onClientCommandError('auth failed')  
        }
        
        console.log('status6: '+this.status)

        //await this.page.waitForTimeout(5000);
        //const client = await this.page.target().createCDPSession();
        //const cookiesObject = await this.page.cookies()
        //const cookiesObject = (await client.send('Network.getAllCookies')).cookies;
        //const sessionStorage = await this.page.evaluate(() =>JSON.stringify(window.sessionStorage));
        //const localStorage = await this.page.evaluate(() => JSON.stringify(window.localStorage));
        //await this.authentication.writeCookies(cookiesObject,sessionStorage,localStorage);
        
        return true;
    }
   

    /**
     * Open new tab in puppeteer browser.
     * @returns {Promise<Page>}
     */
    async openNewPage() {
        //const currentPage = (await this.browser.pages())[0]
        const currentPage = await this.browser.newPage();
        await currentPage.setUserAgent(this.userAgent);

        return currentPage;
    }
    
    async closeClientBrowser(){
             
            try{
                console.log('closeClientBrowser success') 
                await this.browser.close()
            }catch{
                console.log('closeClientBrowser gagal')
            }

    }

    async openBrowse(source) {
        console.log('openBrowse')
        return new Promise(async (resolve) => {
            const currentPage = await this.openNewPage();
            let result
            try{

                await currentPage.goto(source, {
                    waitUntil: 'networkidle0',
                    timeout: 0,
                });
                result = 'openbrowse sukses'
            }catch{
              console.log('invalid url')
              result = 'openbrowse invalid url'
            }

            return resolve(result);

            if (!currentPage.isClosed()) {
                //await currentPage.close();
            }
        });
    }

    async closeBrowse(source) {
        console.log('closeBrowse')
        return new Promise(async (resolve) => {
            await this.closeClientBrowser()            
            return resolve('closebrowse sukses');
            
        });
    }

    async screenShot(source) {
        console.log('screenShot')
        return new Promise(async (resolve) => {
            const pages = (await this.browser.pages()).length
            
            if(pages > 0){
              const path = './public'
              const currentPage = (await this.browser.pages())[pages - 1]
              try {
                await currentPage.screenshot({ path: './public/result.png', fullPage: true })
              }catch{
                await this.authentication.makeDir(path)
                await currentPage.screenshot({ path: './public/result.png', fullPage: true })
              }
              return resolve('result.png');
            }else{
              return resolve('error');
            }        
            
        });
    }

    /**
     * Get URL of specific user picture by their Instagram username.
     * @param {string} username
     * @returns {Promise<string|null>}
     */
    async getUserPicture(username) {
        console.log('getUserPicture')
        return new Promise(async (resolve) => {
            const currentPage = await this.openNewPage();

            const responseHandler = async (response) => {
                if (currentPage.isClosed()) return;

                if (response.url().split("?")[0] == URLS.PROFILE_API) {
                    currentPage.removeListener("response", responseHandler);

                    const responseJSON = await response.json();

                    if (responseJSON.data && responseJSON.data.user && responseJSON.data.user.profile_pic_url_hd) {
                        return resolve(responseJSON.data.user.profile_pic_url_hd);
                    }
                    return resolve(null);
                }
            }

            currentPage.on("response", responseHandler)

            await currentPage.goto(`${URLS.BASE}/${username}`, {
                waitUntil: 'networkidle0',
                timeout: 0,
            });

            resolve(null);

            if (!currentPage.isClosed()) {
                await currentPage.close();
                await this.closeClientBrowser()
            }
        });
    }

    /**
     * Get specific user information.
     * @param {string} username
     * @returns {Promise<object|null>}
     */
    async getUser(username) {
        console.log('getUser')
        return new Promise(async (resolve) => {
            const currentPage = await this.openNewPage();

            const responseHandler = async (response) => {
                if (currentPage.isClosed()) return;

                if (response.url().split("?")[0] == URLS.PROFILE_API) {
                    currentPage.removeListener("response", responseHandler);

                    const responseJSON = await response.json();

                    if (responseJSON.data && responseJSON.data.user) {
                        return resolve(responseJSON.data.user);
                    }
                    return resolve(null);
                }
            }

            currentPage.on("response", responseHandler)

            await currentPage.goto(`${URLS.BASE}/${username}`, {
                waitUntil: 'networkidle0',
                timeout: 0,
            });

            resolve(null);

            if (!currentPage.isClosed()) {
                await currentPage.close();
                await this.closeClientBrowser()
            }
        });
    }
    /**
     * Get current user information.
     * @returns {Promise<object|null>}
     */
    async getInfo() {
        console.log('getInfo')
        return new Promise(async (resolve) => {
            const currentPage = await this.openNewPage();

            const responseHandler = async (response) => {
                if (currentPage.isClosed()) return;

                if (response.url().split("?")[0] == URLS.PROFILE_API) {
                    currentPage.removeListener("response", responseHandler);

                    const responseJSON = await response.json();

                    if (responseJSON.data && responseJSON.data.user) {
                        return resolve(responseJSON.data.user);
                    }
                    return resolve(null);
                }
            }

            currentPage.on("response", responseHandler)

            await currentPage.goto(`${URLS.BASE}/${this.authentication.username}`, {
                waitUntil: 'networkidle0',
                timeout: 0,
            });

            resolve(null);

            if (!currentPage.isClosed()) {
                await currentPage.close();
                await this.closeClientBrowser()
            }
        });
    }

    /**
     * Post new feed.
     * @param {object} params
     * @param {FeedMedia[]} params.media
     * @param {string?} params.caption
     * 
     * @returns Promise<bool>
     */
    async postFeed(params) {
        const {
            media,
            caption = "",
        } = params;

        return new Promise(async (resolve, reject) => {
            if (!media.length) {
                return reject("Media must be an array.");
            }

            function removeAllMedia() {
                media.forEach(val => {
                    val.unlink();
                })
            }

            console.log("mrendownload gambar")
            for (var mediaIndex = 0; mediaIndex < media.length; mediaIndex++) {
                if (media[mediaIndex].url) {
                    await media[mediaIndex].fetch(this.authentication.userMediaDir);
                }
            }

            for (var mediaIndex = 0; mediaIndex < media.length; mediaIndex++) {
                if (!ALLOWED_MEDIA_MIMETYPES.includes(media[mediaIndex].type)) {
                    removeAllMedia();
                    return reject(`${media[mediaIndex].type} is not allowed, occur in index of ${mediaIndex}.`);
                }

                if (media[mediaIndex].type.startsWith('video/')) {
                    var duration = await getVideoDurationInSeconds(media[mediaIndex].path);

                    if (duration > MAX_FEED_VIDEO_DURATION_IN_SECONDS) {
                        removeAllMedia();
                        return reject(`Max feed video duration is ${MAX_FEED_VIDEO_DURATION_IN_SECONDS} seconds, your file is exceed in index of ${fileIndex}.`);
                    }
                }
            }

            console.log("membuka tab baru")
            const currentPage = await this.openNewPage();

            await currentPage.goto(URLS.BASE, {
                waitUntil: 'networkidle0',
                timeout: 0,
            });

            try{
              await currentPage.waitForSelector("svg[aria-label='New post']")
            } catch(e) {
              reject(e)
            }
            console.log("siap upload")
            
            await currentPage.waitForTimeout(3000);

            try{
              await currentPage.evaluate(Injects);
            }catch{}

            const openNewPostModal = await currentPage.evaluate(_ => {
                return window.IGJS.openNewPostModal();
            })
            
            await currentPage.waitForTimeout(2000);

            if (!openNewPostModal) {
                removeAllMedia();
                if (!currentPage.isClosed()) {
                    await currentPage.close();
                }
                return reject("Post modal not found. This is an error, please make a report to us.");
            };

            await Promise.all([
                currentPage.waitForFileChooser().then(fileChooser => {
                    return fileChooser.accept(media.map(x => x.path));
                }),
                currentPage.waitForTimeout(1000).then(() => {
                    return currentPage.evaluate(() => {
                        return window.IGJS.clickSelectFromComputerButton()
                    })
                })
            ])

            await currentPage.waitForSelector('svg[aria-label="Select crop"]');

            const cropButton = await currentPage.evaluate(() => {
                const button = document.querySelector('svg[aria-label="Select crop"]').closest('button')

                if (!button) {
                    return false;
                }

                button.click()
                return true;
            })

            if (!cropButton) {
                removeAllMedia();
                if (!currentPage.isClosed()) {
                    await currentPage.close();
                }
                return reject("Crop button not found. This is an error, please make a report to us.");
            }

            await currentPage.waitForSelector('svg[aria-label="Crop square icon"]');

            // Crop the picture and video.
            async function cropMedia(crop) {
                await currentPage.evaluate((crop) => {
                    [...document.querySelectorAll('div._aacl._aaco._aacw._aad6')]
                        .find(d => d.innerText.toLowerCase().match(crop))
                        .closest('button')
                        .click()
                }, crop)
            }

            for (var mediaIndex = 0; mediaIndex < media.length; mediaIndex++) {
                //await cropMedia(media[mediaIndex].cropSize);

                if (mediaIndex != media.length - 1) {
                    await currentPage.evaluate(() => {
                        //document.querySelector('svg[aria-label="Right chevron"]').closest('button').click();
                    })
                }
            }

            // Next to the filters and adjustments.
            await currentPage.evaluate(() => {
                //[...document.querySelectorAll('button')].find(b => b.innerText.toLowerCase().match('next')).click();
                [...document.querySelectorAll('div[role="button"]')].find(b => b.innerText.toLowerCase().match('next')).click();
            })

            await currentPage.waitForTimeout(2000);

            // Next to the create a post.
            await currentPage.evaluate(() => {
                [...document.querySelectorAll('div[role="button"]')].find(b => b.innerText.toLowerCase().match('next')).click();
            })

            // Wait for transition.
            await currentPage.waitForTimeout(1000);

            console.log("menambahkan caption")
            if (caption) {
                await currentPage.waitForSelector('[contenteditable="true"][role="textbox"]')
                await currentPage.type('[contenteditable="true"][role="textbox"]', caption)
                await currentPage.waitForTimeout(500);

            }
            await currentPage.waitForTimeout(5000);
            console.log('mulai upload')

            // Share the post.
            await currentPage.evaluate(() => {
                [...document.querySelectorAll('div[role="button"]')].find(b => b.innerText.toLowerCase().match('share')).focus();
                [...document.querySelectorAll('div[role="button"]')].find(b => b.innerText.toLowerCase().match('share')).click();
            })
                        
            
            await currentPage.waitForNetworkIdle({
                timeout: 60 * 2 * 1000
            });
            
            try{
                await currentPage.waitForFunction(
                  '[...document.querySelectorAll("span")].find(b => b.innerText.toLowerCase().match("your post has been shared"))',
                );
                console.log('posting sukses')            
            } catch(e) {
              console.log('posting gagal')
              console.log(e)
              reject(e)
            }
            
            removeAllMedia();

            if (!currentPage.isClosed()) {
                await currentPage.close();
                await this.closeClientBrowser()
            }
            
            resolve(true);
        });
    }


    async postVideo(params) {
        const {
            media,
            caption = "",
        } = params;

        return new Promise(async (resolve, reject) => {
            if (!media.length) {
                return reject("Media must be an array.");
            }

            function removeAllMedia() {
                media.forEach(val => {
                    val.unlink();
                })
            }

            console.log("mrendownload video")
            for (var mediaIndex = 0; mediaIndex < media.length; mediaIndex++) {
                if (media[mediaIndex].url) {
                    await media[mediaIndex].fetch(this.authentication.userMediaDir);
                }
            }

            for (var mediaIndex = 0; mediaIndex < media.length; mediaIndex++) {
                if (!ALLOWED_MEDIA_MIMETYPES.includes(media[mediaIndex].type)) {
                    removeAllMedia();
                    return reject(`${media[mediaIndex].type} is not allowed, occur in index of ${mediaIndex}.`);
                }

                if (media[mediaIndex].type.startsWith('video/')) {
                    var duration = await getVideoDurationInSeconds(media[mediaIndex].path);

                    if (duration > MAX_FEED_VIDEO_DURATION_IN_SECONDS) {
                        removeAllMedia();
                        return reject(`Max feed video duration is ${MAX_FEED_VIDEO_DURATION_IN_SECONDS} seconds, your file is exceed in index of ${fileIndex}.`);
                    }
                }
            }

            console.log("membuka tab baru")
            const currentPage = await this.openNewPage();

            await currentPage.goto(URLS.BASE, {
                waitUntil: 'networkidle0',
                timeout: 0,
            });

            try{
              await currentPage.waitForSelector("svg[aria-label='New post']")
            } catch(e) {
              reject(e)
            }
            console.log("siap upload")

            try{
              await currentPage.evaluate(Injects);
            }catch{}

            const openNewPostModal = await currentPage.evaluate(_ => {
                return window.IGJS.openNewPostModal();
            })

            if (!openNewPostModal) {
                removeAllMedia();
                if (!currentPage.isClosed()) {
                    await currentPage.close();
                }
                return reject("Post modal not found. This is an error, please make a report to us.");
            };

            await Promise.all([
                currentPage.waitForFileChooser().then(fileChooser => {
                    return fileChooser.accept(media.map(x => x.path));
                }),
                currentPage.waitForTimeout(1000).then(() => {
                    return currentPage.evaluate(() => {
                        return window.IGJS.clickSelectFromComputerButton()
                    })
                })
            ])

            await currentPage.waitForSelector('svg[aria-label="Select crop"]');

            const cropButton = await currentPage.evaluate(() => {
                const button = document.querySelector('svg[aria-label="Select crop"]').closest('button')

                if (!button) {
                    return false;
                }

                button.click()
                return true;
            })

            if (!cropButton) {
                removeAllMedia();
                if (!currentPage.isClosed()) {
                    await currentPage.close();
                }
                return reject("Crop button not found. This is an error, please make a report to us.");
            }

            await currentPage.waitForSelector('svg[aria-label="Crop square icon"]');

            // Crop the picture and video.
            async function cropMedia(crop) {
                await currentPage.evaluate((crop) => {
                    [...document.querySelectorAll('div._aacl._aaco._aacw._aad6')]
                        .find(d => d.innerText.toLowerCase().match(crop))
                        .closest('button')
                        .click()
                }, crop)
            }

            for (var mediaIndex = 0; mediaIndex < media.length; mediaIndex++) {
                //await cropMedia(media[mediaIndex].cropSize);

                if (mediaIndex != media.length - 1) {
                    await currentPage.evaluate(() => {
                        //document.querySelector('svg[aria-label="Right chevron"]').closest('button').click();
                    })
                }
            }

            // notif video share as reels now.
            //await currentPage.evaluate(() => {
                //[...document.querySelectorAll('button')].find(b => b.innerText.toLowerCase().match('ok')).click();
            //})

            // Next to the filters and adjustments.
            await currentPage.evaluate(() => {
                //[...document.querySelectorAll('button')].find(b => b.innerText.toLowerCase().match('next')).click();
                [...document.querySelectorAll('div[role="button"]')].find(b => b.innerText.toLowerCase().match('next')).click();
            })

            await currentPage.waitForTimeout(200);

            // Next to the create a post.
            await currentPage.evaluate(() => {
                [...document.querySelectorAll('div[role="button"]')].find(b => b.innerText.toLowerCase().match('next')).click();
            })

            // Wait for transition.
            await currentPage.waitForTimeout(1000);

            console.log("menambahkan caption")
            if (caption) {
                await currentPage.waitForSelector('[contenteditable="true"][role="textbox"]')
                await currentPage.type('[contenteditable="true"][role="textbox"]', caption)
                await currentPage.waitForTimeout(500);

            }
            
            console.log('mulai upload')

            // Share the post.
            await currentPage.evaluate(() => {
                [...document.querySelectorAll('div[role="button"]')].find(b => b.innerText.toLowerCase().match('share')).focus();
                [...document.querySelectorAll('div[role="button"]')].find(b => b.innerText.toLowerCase().match('share')).click();
            })

            await currentPage.waitForNetworkIdle({
                timeout: 60 * 2 * 1000
            });

            try{
                await currentPage.waitForFunction(
                  '[...document.querySelectorAll("span")].find(b => b.innerText.toLowerCase().match("your reel has been shared"))',
                );
                console.log('posting suskses')            
            } catch(e) {
              console.log('posting gagal')   
              console.log(e)
              reject(e)
            }
            
            removeAllMedia();

            if (!currentPage.isClosed()) {
                await currentPage.close();
                await this.closeClientBrowser()
            }

            resolve(true);
        });
    }
}

module.exports = Client