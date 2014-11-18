'use strict';

var
    fs = require('fs'),
    io = require('node-toybox/io'),
    debug = require('debug')('express-webapp-assets:filter:concat'),
    DEBUG = debug.enabled;

module.exports = function (src, dst, opts, callback) {
    return fs.readFile(src, 'utf8', function (err, data) {
        if (err) {
            DEBUG && debug('concat err', err, src, '-->', dst);
            return callback(err);
        }
        var files = data.split('\n').filter(function (line) {
            return line.length > 0 && line.charAt(0) !== '#';
        });
        DEBUG && debug('concat', src, '-->', files, '-->', dst);
        return io.concatFiles(files, dst, callback);
    });
};
module.exports.ext = 'concat';
