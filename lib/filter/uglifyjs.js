'use strict';

var
    fs = require('fs'),
    UglifyJS = require('uglify-js'),
    debug = require('debug')('express-webapp-assets:filter:uglifyjs'),
    DEBUG = debug.enabled;

module.exports = function (src, dst, opts, callback) {
    return fs.readFile(src, 'utf8', function (err, srcData) {
        if (err) {
            DEBUG && debug('uglifyjs err', err, src, '-->', dst);
            return callback(err);
        }
        DEBUG && debug('uglifyjs', src, '-->', dst);
        var options = {
            filename: src,
            toplevel: null
        };
        try {
            options.toplevel = UglifyJS.parse(srcData, options);
            options.toplevel.figure_out_scope();
            options.toplevel = options.toplevel.transform(UglifyJS.Compressor({}));
            options.toplevel.compute_char_frequency();
            options.toplevel.mangle_names();
            var dstData = options.toplevel.print_to_string();
            return fs.writeFile(dst, dstData, 'utf8', callback);
        } catch (err) {
            DEBUG && debug('uglifyjs err', err, src, '-->', dst);
            return callback(err);
        }
    });
};
module.exports.ext = 'min.js';

