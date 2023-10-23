require("dotenv").config();
const { Client, Authentication, FeedMedia, EVENTS, CROP_SIZES } = require("./instagram/instagram");

const posting = (data) => {
  let command = data.command
  let source = data.source
  let caption = data.caption
  let user = data.user
  let pass = data.pass
  return new Promise((resolve, reject) => {
  
      const client = puppeterclient
      
      if(user&&pass){
        client.authentication.username = user
        client.authentication.password = pass
        client.authentication.dataDirName = user
        client.puppeteerOptions.userDataDir = false
      }else{
        client.authentication.username = process.env.IG_USERNAME
        client.authentication.password = process.env.IG_PASSWORD
        client.authentication.dataDirName = process.env.IG_USERNAME
        client.puppeteerOptions.userDataDir = false
      }
      client.removeAllListeners('commanderror')
      client.removeAllListeners('commandsukses')
      client.removeAllListeners('authenticated')
      client.removeAllListeners('auth_failure')
      
      client.on("authenticated", async () => {
            console.log('tunggu random 5-12 detik')
            const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
            await delay((Math.floor(Math.random() * 12) + 5) * 1000)

            if (command == "gambar") {
                const myPromise = client.postFeed({
                    media: [
                        FeedMedia.fromUrl({
                            url: source,
                            cropSize: CROP_SIZES.ORIGINAL
                        }),
                    ],
                    crop: CROP_SIZES.ORIGINAL,
                    caption: caption
                })
                myPromise.then(
                  function(value) { console.log(value);client.onClientCommandSukses(value); },
                  function(error) { console.log(error);client.onClientCommandError(error); }
                )
            } else if(command == "video"){
                const myPromise = client.postVideo({
                    media: [
                        FeedMedia.fromUrl({
                            url: source,
                            cropSize: CROP_SIZES.ORIGINAL
                        }),
                    ],
                    crop: CROP_SIZES.ORIGINAL,
                    caption: caption
                })
                myPromise.then(
                  function(value) { console.log(value);client.onClientCommandSukses(value); },
                  function(error) { console.log(error);client.onClientCommandError(error); }
                )
            } else {
                console.log('tidaktahu')
                client.onClientCommandError('error');
            }
      });
      
      client.on("commandsukses", (value) => {
        client.closeClientBrowser()
        return resolve(value)
      });

      client.on("commanderror", (error) => {
        client.closeClientBrowser()
        return reject(error)
      });
      
      client.initialize('login')
  });
};

module.exports = { posting };
