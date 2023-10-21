'use strict'

const Constants = require("./instagram/utilities/Constants");

module.exports = {
    Client: require("./instagram/Client"),
    Authentication: require("./instagram/structures/Authentication"),
    FeedMedia: require("./instagram/structures/FeedMedia"),
    version: require('./package.json').version,

    ...Constants
}