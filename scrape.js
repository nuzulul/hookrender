require("dotenv").config();

const scrape = (data) => {
  let command = data.command
  let source = data.source

  return new Promise(async(resolve, reject) => {
      
      const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

      const client = puppeterclient
      
      if(command == "forcekill"){
        await client.closeClientBrowser()
        return resolve('forcekill success')
      }
      
      client.removeAllListeners('commanderror')
      client.removeAllListeners('commandsukses')
      client.removeAllListeners('authenticated')
      client.removeAllListeners('auth_failure')
      
      client.on("auth_failure", async () => {

      });
      
      client.on("commandsukses",async (value) => {
        console.log('command sukses ')
        return resolve(value)
      });

      client.on("commanderror",async (error) => {
        console.log('command error now close browser')
        await client.closeClientBrowser()
        return reject(error)
      });
      
      const launch = client.initialize()
      
      if (launch) {
        console.log('tunggu random 5-12 detik')
        await delay((Math.floor(Math.random() * 12) + 5) * 1000)
        if (command == "user") {
            const myPromise = client.getUser(source)
            myPromise.then(
              function(value) { console.log(value);client.onClientCommandSukses(value); },
              function(error) { console.log(error);client.onClientCommandError(error); }
            )
        } else if(command == "picture"){
            const myPromise = client.getUserPicture(source)
            myPromise.then(
              function(value) { console.log(value);client.onClientCommandSukses(value); },
              function(error) { console.log(error);client.onClientCommandError(error); }
            )
        } else if(command == "openbrowse"){
            const myPromise = client.openBrowse(source)
            myPromise.then(
              function(value) { console.log(value);client.onClientCommandSukses(value); },
              function(error) { console.log(error);client.onClientCommandError(error); }
            )
        } else if(command == "closebrowse"){
            const myPromise = client.closeBrowse(source)
            myPromise.then(
              function(value) { console.log(value);client.onClientCommandSukses(value); },
              function(error) { console.log(error);client.onClientCommandError(error); }
            )
        } else if(command == "screenshot"){
            const myPromise = client.screenShot(source)
            myPromise.then(
              function(value) { console.log(value);client.onClientCommandSukses(value); },
              function(error) { console.log(error);client.onClientCommandError(error); }
            )
        } else {
            console.log('tidaktahu')
            client.onClientCommandError('error');
        }
      }
  });
};

module.exports = { scrape };
