'use strict';

var
    fs = require('fs'),
    less = require('less'),
    debug = require('debug')('express-webapp-assets:filter:less'),
    DEBUG = debug.enabled;

module.exports = function (src, dst, opts, callback) {
    return fs.readFile(src, 'utf8', function (err, srcData) {
        if (err) {
            DEBUG && debug('less err', err, src, '-->', dst);
            return callback(err);
        }
        DEBUG && debug('less', src, '-->', dst);
        opts = opts || {};
        opts.filename = src;
        less.render(srcData, opts, function (err, dstData) {
            if (err) {
                DEBUG && debug('less err', err, src, '-->', dst);
                return callback(err);
            }
            return fs.writeFile(dst, dstData.css, 'utf8', callback);
        });
    });
};
module.exports.ext = 'less';
