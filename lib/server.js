'use strict';

/** @module express-webapp-assets/server */

var
    path = require('path'),
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

    DEBUG && debug('start server on', config.host + ':' + config.port + config.mount);

    var app = express()
        .use(serveStatic(path.resolve(process.cwd(), config.root)))
        .use(config.mount, assets(config))
        .listen(config.port, config.host, callback && function () {
            callback(config);
        });
};

