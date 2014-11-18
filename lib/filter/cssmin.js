'use strict';

var
    fs = require('fs'),
    cssmin = require('cssmin'),
    debug = require('debug')('express-webapp-assets:filter:cssmin'),
    DEBUG = debug.enabled;

module.exports = function (src, dst, opts, callback) {
    return fs.readFile(src, 'utf8', function (err, srcData) {
        if (err) {
            DEBUG && debug('cssmin err', err, src, '-->', dst);
            return callback(err);
        }
        DEBUG && debug('cssmin', src, '-->', dst);
        try {
            var dstData = cssmin(srcData);
            return fs.writeFile(dst, dstData, 'utf8', callback);
        } catch (err) {
            DEBUG && debug('cssmin err', err, src, '-->', dst);
            return callback(e);
        }
    });
};
module.exports.ext = 'min.css';
