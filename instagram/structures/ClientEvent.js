'use strict'

const EventEmitter = require('events');
const { STATUS, URLS, EVENTS } = require('../utilities/Constants');

/**
 * Base class of Client.
 */
class ClientEvent extends EventEmitter {
    authentication;
    puppeteerOptions;
    userAgent;

    browser;
    page;
    status;

    constructor() {
        super();
    }

    listen() {
        this.on(EVENTS.PREAUTHENTICATED, this.onClientPreAuthenticated);
        this.on(EVENTS.AUTHENTICATED, this.onClientAuthenticated);
        this.on(EVENTS.AUTHENTICATION_FAILURE, this.onClientAuthenticationFaulure);
    }

    onClientPreAuthenticated() {
        this.status = STATUS.PREAUTHENTICATED;
    }

    onClientPosAuthenticated() {
        this.emit(EVENTS.AUTHENTICATED);
    }

    onClientAuthenticated() {
        this.page.removeListener("response", this.onPageAuthenticationResponse);
        this.status = STATUS.AUTHENTICATED;
    }

    onClientAuthenticationFaulure() {
        this.status = STATUS.UNAUTHENTICATED;
        this.onClientCommandError();
    }

    onPageAuthenticationResponse = async (response) => {
        //console.log(response.status())
        //console.log(response.url())
        if (response.status() == 302 && response.url() == URLS.LOGIN) {
            console.log('auth sukses from 302')
            this.emit(EVENTS.AUTHENTICATED);
        }
        if (response.url().split("?")[0] == URLS.LOGIN_API) {
            const responseJSON = await response.json();
          
            if (responseJSON.authenticated) {
                console.log('auth sukses from url login api')
                this.emit(EVENTS.PREAUTHENTICATED);
            } else {
                console.log('auth fail')
                this.emit(EVENTS.AUTHENTICATION_FAILURE);
            }
        }
    }
    
    onClientCommandSukses(){
      this.emit('commandsukses');
    }

    onClientCommandError(){
      this.emit('commanderror');
    }
}

module.exports = ClientEvent;