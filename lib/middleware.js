'use strict';

/** @module express-webapp-assets/middleware */

var Assets = require('./assets');

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
            //return err ? next(err) : res.sendFile(file);
            if (err) {
                return res.status(404).send('404 NOT FOUND').end();
            }
            return res.sendFile(file);
        });
    };
};
