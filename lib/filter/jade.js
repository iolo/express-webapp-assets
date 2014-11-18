'use strict';

var
    fs = require('fs'),
    jade = require('jade'),
    debug = require('debug')('express-webapp-assets:filter:jade'),
    DEBUG = debug.enabled;

module.exports = function (src, dst, opts, callback) {
    return fs.readFile(src, 'utf8', function (err, srcData) {
        if (err) {
            DEBUG && debug('jade err', err, src, '-->', dst);
            return callback(err);
        }
        DEBUG && debug('jade', src, '-->', dst);
        opts = opts || {};
        opts.filename = src;
        jade.render(srcData, opts, function (err, dstData) {
            if (err) {
                DEBUG && debug('jade err', err);
                return callback(err);
            }
            return fs.writeFile(dst, dstData, 'utf8', callback);
        });
    });
};
module.exports.ext = 'jade';