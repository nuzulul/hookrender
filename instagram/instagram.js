'use strict'

const Constants = require("./utilities/Constants");

module.exports = {
    Client: require("./Client"),
    Authentication: require("./structures/Authentication"),
    FeedMedia: require("./structures/FeedMedia"),
    version: "1.0.2",

    ...Constants
}