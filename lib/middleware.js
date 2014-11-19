'use strict';

/** @module express-webapp-assets/middleware */

var
    util = require('util'),
    Assets = require('./assets'),
    debug = require('debug')('express-webapp-assets:middleware'),
    DEBUG = debug.enabled;

/**
 * middleware for API server written in express/node.js.
 *
 * @param {AssetsConfig} config
 * @returns {function} connect/express middleware
 */
module.exports = function (config) {
    var assets = new Assets(config);
    return function (req, res, next) {
        assets.resolve(req.path, function (err, file) {
            DEBUG && debug('asset resolve', err, req.path, '-->', file);
            return err ? next(err) : res.sendFile(file);
            // TODO: better error handling...
            //if (err) {
            //    var message = util.inspect(err, {depth: null});
            //    return res.status(404).type('text').send('NOT FOUND ' + req.path + '\n' + message).end();
            //}
            //return res.sendFile(file);
        });
    };
};
