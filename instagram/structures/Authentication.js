'use strict'

const path = require('path');
const fs = require('fs');

class Authentication {
    username;
    password;
    dataPath;
    mediaPath;
    clientId;

    client;
    dataDirName;
    userDataDir;
    userMediaDir;
    usercookies;
    sessionStorage;
    localStorage;
    defaultuser;
    defaultpass;

    constructor({
        username,
        password,
        dataPath = "./.instagram_auth",
        mediaPath = "./.instagram_media",
        clientId,
    }) {
        const idRegex = /^[-_\w]+$/i;
        if (clientId && !idRegex.test(clientId)) {
            throw new Error('Invalid clientId. Only alphanumeric characters, underscores and hyphens are allowed.');
        }

        this.username = username;
        this.password = password;
        this.defaultuser = username;
        this.defaultpass = password;
        this.clientId = clientId;
        this.dataPath = path.resolve(dataPath);
        this.mediaPath = path.resolve(mediaPath);
        this.dataDirName = this.clientId ? `userdata-${this.clientId}` : "userdata"
    }

    injectClient(client) {
        this.client = client;
    }

    async setupUserDir() {
        const userDataDir = path.join(this.dataPath, this.dataDirName);
        const userMediaDir = path.join(this.mediaPath, this.dataDirName);

        if (this.client.puppeteerOptions.userDataDir && this.client.puppeteerOptions.userDataDir != userDataDir) {
            throw new Error("Authentication's dataPath is not compatible with a user-supplied userDataDir.");
        }

        fs.mkdirSync(userDataDir, {
            recursive: true
        })


        fs.mkdirSync(userMediaDir, {
            recursive: true
        })

        this.userDataDir = userDataDir;
        this.userMediaDir = userMediaDir;
    }
    
    async makeDir(dir){
        fs.mkdirSync(dir, {
            recursive: true
        })
    }
    
    async readCookies(){
        const cookiesPath = "./cookies.txt"
        const sessionStoragePath = "./sessionStorage.txt"
        const localStoragePath = "./localStorage.txt"
        const previousSession = fs.existsSync(cookiesPath)
        if (previousSession) {
          const content = fs.readFileSync(cookiesPath);
          const cookiesArr = JSON.parse(content);
          if (cookiesArr.length !== 0) {
            this.usercookies = cookiesArr;
          }
        } else {
          this.usercookies = [];
        }
        if (fs.existsSync(sessionStoragePath)){
          const sessionStorage = fs.readFileSync(sessionStoragePath);
          this.sessionStorage = sessionStorage
        } else {
          this.sessionStorage = JSON.stringify({})
        }
        if (fs.existsSync(localStoragePath)){
          const localStorage = fs.readFileSync(localStoragePath);
          this.localStorage = localStorage
        } else {
          this.localStorage = JSON.stringify({})
        }
    }
    
    async writeCookies(cookiesObject,sessionStorage,localStorage){
      const cookiesPath = "./cookies.txt"
      const sessionStoragePath = "./sessionStorage.txt"
      const localStoragePath = "./localStorage.txt"
      fs.writeFileSync(cookiesPath, JSON.stringify(cookiesObject));
      fs.writeFileSync(sessionStoragePath, sessionStorage);
      fs.writeFileSync(localStoragePath, localStorage);
      console.log('Session has been saved to ' + cookiesPath);
    }
}

module.exports = Authentication