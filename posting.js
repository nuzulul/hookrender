require("dotenv").config();
const { Client, Authentication, FeedMedia, EVENTS, CROP_SIZES } = require("./instagram");

const posting = (data) => {
  let command = data.command
  let source = data.source
  let caption = data.caption
  return new Promise((resolve, reject) => {
      const client = new Client({
          authentication: new Authentication({
              username: process.env.IG_USERNAME,
              password: process.env.IG_PASSWORD,
          }),
          puppeteerOptions: {
              headless: true,
              args: [
                "--disable-setuid-sandbox",
                "--no-sandbox",
                "--single-process",
                "--no-zygote",
                "--disable-features=site-per-process"
              ],
          }
      });
      
      client.on("authenticated", async () => {
      console.log('tunggu 5 detik')
      const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
      await delay(5000)

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
              function(value) { console.log('upload gambar sukses');client.onClientCommandSukses(); },
              function(error) { console.log('upload gambar gagal');client.onClientCommandError(); }
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
              function(value) { console.log('upload video sukses');client.onClientCommandSukses(); },
              function(error) { console.log('upload video gagal');client.onClientCommandError(); }
            )
        } else {
            console.log('tidaktahu')
            client.onClientCommandError();
        }
      });
      
      client.on("commandsukses", () => {
        client.closeClientBrowser()
        resolve(true)
      });

      client.on("commanderror", () => {
        client.closeClientBrowser()
        reject()
      });
      
      client.initialize()
  });
};

module.exports = { posting };
