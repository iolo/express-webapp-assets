'use strict';

/** @module express-webapp-assets/generator */

var
    path = require('path'),
    io = require('node-toybox/io'),
    async = require('node-toybox/async'),
    Assets = require('./assets'),
    debug = require('debug')('express-webapp-assets:generator'),
    DEBUG = debug.enabled;

/**
 * generates static assets for all assets written in server-side templates/preprocessors.
 *
 * @param {AssetsConfig} [config]
 * @param {function} callback
 */
module.exports = function (config, callback) {
    var assets = new Assets(config);

    io.iterateFiles(assets.config.src, function () {
        return true;
    }, function () {
        return false;
    }, function (err, files) {
        if (err) {
            DEBUG && debug('failed to iterate files...', err);
            return callback(err);
        }

        var errors = [];
        var generated = [];

        // single source asset may generate multiple static files(uncompressed and compress version)
        var assetNames = files.reduce(function (assetNames, file) {
            return assetNames.concat(assets._getPossibleNames(file));
        }, []);

        DEBUG && debug('*****************src=', assetNames);
        DEBUG && debug('generating', assetNames.length, 'assets from', files.length, 'files...');
        async.reduce(assetNames, function (prev, assetName, next) {
            assets.resolve(assetName, function (err, result) {
                if (err) {
                    errors.push(err); // accumulate errors
                    //return next(err); // break on error
                }
                generated.push(result); // accumulate results
                next(null, generated); // ignore error and continue
            });
        }, function (err, generated) {
            DEBUG && debug('generated', generated.length, 'assets with', errors.length, 'errors');
            callback(err || errors, generated);
        });
    });
};