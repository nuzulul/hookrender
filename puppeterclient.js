require("dotenv").config();
const { Client, Authentication, FeedMedia, EVENTS, CROP_SIZES } = require("./instagram/instagram");

const PUPPETEER_HEADLESS = process.env.PUPPETEER_HEADLESS === "FALSE"?false:true
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

global.puppeterclient = client