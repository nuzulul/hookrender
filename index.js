const express = require("express");
const { posting} = require("./posting");
const app = express();
const cors = require('cors')
const bodyParser = require('body-parser')
const PORT = process.env.PORT || 4000;

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cors())

app.route('/posting')
  .get( (req, res, next) => {
    res.send("get ok");
  })
  .post( (req, res, next) => {
    try {
      let data = req.body;
      
      //console.log(JSON.stringify(data))
      res.send("post ok")
      res.on('finish', () => {
          console.log('Response has been sent!')
          //postPhoto();
          if(data.command == 'gambar' || data.command == 'video'){
              //Promise.all([posting(data)]).then((val) => {

                  //myPromise = val[0];
                  const myPromise = posting(data)
                  myPromise.then(
                    function(value) { console.log('kode sukses') },
                    function(error) { console.log('kode gagal') }
                  );
                  //console.log('I am called after all promises completed.')
              //});
          }
      })
      next();
    } catch(e){
      next(e)  
    }
  });

app.get("/", (req, res) => {
  res.send("Render Puppeteer server is up and running!");
});

app.get("/ok", (req, res) => {
  res.send("ok");
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
