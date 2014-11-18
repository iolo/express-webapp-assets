'use strict';

/** @module express-webapp-assets/server */

var
    _ = require('lodash'),
    express = require('express'),
    serveStatic = require('serve-static'),
    assets = require('./middleware'),
    debug = require('debug')('express-webapp-assets:server'),
    DEBUG = debug.enabled;

/**
 * simple http server for external API server written in other frameworks/languages.
 *
 * @param {AssetsConfig} config
 * @param {string} [config.host='localhost']
 * @param {number} [config.port=3000]
 * @param {string} [config.root='./public']
 * @param {string} [config.mount='/']
 * @param {function} [callback] for `express.application.listen`
 * @returns {express.application}
 */
module.exports = function (config, callback) {
    config = _.merge({
        host: 'localhost',
        port: 3000,
        root: './public',
        mount: '/'
    }, config);

    console.log('start server on', config.host + ':' + config.port + config.mount);

    express()
        .use(serveStatic(config.root))
        .use(config.mount, assets(config))
        .listen(config.port, config.host, callback);
};

