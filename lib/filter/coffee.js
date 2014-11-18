'use strict';

var
    fs = require('fs'),
    coffee = require('coffee-script'),
    debug = require('debug')('express-webapp-assets:filter:coffee'),
    DEBUG = debug.enabled;

module.exports = function (src, dst, opts, callback) {
    return fs.readFile(src, 'utf8', function (err, srcData) {
        if (err) {
            DEBUG && debug('coffee', err, src, '-->', dst);
            return callback(err);
        }
        DEBUG && debug('coffee', src, '-->', dst);
        try {
            opts = opts || {};
            opts.filename = src;
            var dstData = coffee.compile(srcData, opts);
            return fs.writeFile(dst, dstData, 'utf8', callback);
        } catch (err) {
            DEBUG && debug('coffee', err, src, '-->', dst);
            return callback(e);
        }
    });
};
module.exports.ext = 'coffee';
