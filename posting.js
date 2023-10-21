require("dotenv").config();
const { Client, Authentication, FeedMedia, EVENTS, CROP_SIZES } = require("./instagram");

const posting = async (data) => {
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
      
      client.on("authenticated", () => {

        if (command == "gambar") {
            const data = client.postFeed({
                media: [
                    FeedMedia.fromUrl({
                        url: source,
                        cropSize: CROP_SIZES.ORIGINAL
                    }),
                ],
                crop: CROP_SIZES.ORIGINAL,
                caption: caption
            })
            console.log(data)
        } else if(command == "video"){
            const data = client.postVideo({
                media: [
                    FeedMedia.fromUrl({
                        url: source,
                        cropSize: CROP_SIZES.ORIGINAL
                    }),
                ],
                crop: CROP_SIZES.ORIGINAL,
                caption: caption
            })
            console.log(data)
        } else {
            console.log('tidaktahu')
        }
      });
      
      client.on("commandfinish", () => {
        client.closeClientBrowser()
        resolve(true)
      });
      
      client.initialize()
  });
};

module.exports = { posting };
