'use strict';

/** @module express-webapp-assets/server */

var
    path = require('path'),
    _ = require('lodash'),
    express = require('express'),
    serveStatic = require('serve-static'),
    assets = require('./middleware');

/**
 * simple http server for external API server written in other frameworks/languages.
 *
 * @param {AssetsConfig} config
 * @param {string} [config.root='./public']
 * @param {string} [config.host='localhost']
 * @param {number} [config.port=3000]
 * @param {function} [callback] for `express.application.listen`
 * @returns {express.application}
 */
module.exports = function (config, callback) {
    config = _.merge({
        host: 'localhost',
        port: 3000,
        root: path.resolve(process.cwd(), config.root || './public')
    }, config);
    return express()
        .use(serveStatic(config.root))
        .use(config.src, assets(config))
        .listen(config.port, config.host, callback);
};

