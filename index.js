require('./puppeterclient')
require("dotenv").config()

const express = require("express");
const { posting} = require("./posting");
const { scrape} = require("./scrape");
const { bot} = require("./bot");
const { detectpuppeteer} = require("./detectpuppeteer");
const app = express();
const cors = require('cors')
const bodyParser = require('body-parser')
const PORT = process.env.PORT || 4000;


let commandready = true
let result = 'true'

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cors())
//app.use('/static', express.static('public'))
app.use(express.static('public'))

app.get("/", (req, res) => {
  res.send("Render Puppeteer server is up and running!");
});

app.get("/ok", (req, res) => {
  res.send("ok");
});

app.route('/posting')
  .get( (req, res, next) => {
    if(commandready){
      res.send(result)
    }else{
      res.send(commandready);
    }
  })
  .post( (req, res, next) => {
    try {
      let data = req.body
      let key = process.env.HOOKRENDER_APIKEY
      if(data.apikey == key){
        res.send("ok")
      }else{
        res.send("apikey invalid")
      }
      res.on('finish', () => {
          console.log('Response has been sent!')
          //postPhoto();
          if((data.command == 'gambar' || data.command == 'video')&&commandready&&data.apikey == key){
              //Promise.all([posting(data)]).then((val) => {

                  //myPromise = val[0];
                  console.log('command:'+data.command)
                  commandready=false
                  const myPromise = posting(data)
                  myPromise.then(
                    function(value) { result = value;console.log(value);console.log('kode sukses');commandready=true; },
                    function(error) { result = error;console.log(error);console.log('kode gagal');commandready=true; }
                  );
                  //console.log('I am called after all promises completed.')
              //});
          }else{
            console.log('command:null')
          }
      })
      next();
    } catch(e){
      next(e)  
    }
  });

app.route('/scrape')
  .get( (req, res, next) => {
    if(commandready){
      res.send(result)
    }else{
      res.send(commandready);
    }
  })
  .post( (req, res, next) => {
    try {
      let data = req.body;
      let key = process.env.HOOKRENDER_APIKEY
      if(data.apikey == key){
        if(commandready&&data.command=='getresult'){
          res.send(result)
        }else if(!commandready&&data.command=='getresult'){
          res.send(coomandready)
        }else if(data.command == 'getready'){
          res.send(commandready);
        }else{
          res.send("ok")
        }
      }else{
        res.send("apikey invalid")
      }
            
      res.on('finish', () => {
          console.log('Response has been sent!')
          //postPhoto();
          if(((data.command == 'user' || data.command == 'picture' || data.command == 'openbrowse' || data.command == 'closebrowse' || data.command == 'screenshot')&&commandready&&data.apikey == key)||(data.command == 'forcekill'&&data.apikey == key)){
              //Promise.all([posting(data)]).then((val) => {

                  //myPromise = val[0];
                  console.log('command:'+data.command)
                  commandready=false
                  const myPromise = scrape(data)
                  myPromise.then(
                    function(value) { result = value;console.log(value);console.log('kode sukses');commandready=true; },
                    function(error) { result = value;console.log(error);console.log('kode gagal');commandready=true; }
                  );
                  //console.log('I am called after all promises completed.')
              //});
          }else{
            console.log('command:null')
          }
      })
      next();
    } catch(e){
      next(e)  
    }
  });

app.get("/bot", (req, res) => {
  bot(res);
});

app.get("/detectpuppeteer", (req, res) => {
  detectpuppeteer(res);
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
