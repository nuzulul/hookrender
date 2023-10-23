require("dotenv").config();
const { Client, Authentication, FeedMedia, EVENTS, CROP_SIZES } = require("./instagram/instagram");

const scrape = (data) => {
  let command = data.command
  let source = data.source

  return new Promise(async(resolve, reject) => {
      const PUPPETEER_HEADLESS = process.env.PUPPETEER_HEADLESS === "TRUE"?true:false
      const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
      const client = new Client({
          authentication: new Authentication({
              username: "ig",
              password: "ig",
          }),
          puppeteerOptions: {
              headless: PUPPETEER_HEADLESS,
              args: [
                "--disable-setuid-sandbox",
                "--no-sandbox",
                "--single-process",
                "--no-zygote",
                "--disable-features=site-per-process"
              ],
          }
      });
      
      client.on("auth_failure", async () => {

      });
      
      client.on("commandsukses",async () => {
        console.log('command sukses')
        resolve(true)
      });

      client.on("commanderror",async () => {
        console.log('command error now close browser')
        client.closeClientBrowser()
        console.log('tunggu random 5-12 detik')
        reject()
      });
      
      const launch = client.initialize()
      if (launch) {
        console.log('tunggu random 5-12 detik')
        await delay((Math.floor(Math.random() * 12) + 5) * 1000)
        if (command == "user") {
            const myPromise = client.getUser(source)
            myPromise.then(
              function(value) { console.log(value);client.onClientCommandSukses(); },
              function(error) { console.log(error);client.onClientCommandError(); }
            )
        } else if(command == "picture"){
            const myPromise = client.getUserPicture(source)
            myPromise.then(
              function(value) { console.log(value);client.onClientCommandSukses(); },
              function(error) { console.log(error);client.onClientCommandError(); }
            )
        } else if(command == "openbrowse"){
            const myPromise = client.openBrowse(source)
            myPromise.then(
              function(value) { console.log(value);client.onClientCommandSukses(); },
              function(error) { console.log(error);client.onClientCommandError(); }
            )
        } else if(command == "closebrowse"){
            const myPromise = client.closeBrowse(source)
            myPromise.then(
              function(value) { console.log(value);client.onClientCommandSukses(); },
              function(error) { console.log(error);client.onClientCommandError(); }
            )
        } else {
            console.log('tidaktahu')
            client.onClientCommandError();
        }
      }
  });
};

module.exports = { scrape };
