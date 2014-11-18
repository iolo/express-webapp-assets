'use strict';

/** @module express-webapp-assets/assets */

var
    fs = require('fs'),
    path = require('path'),
    _ = require('lodash'),
    io = require('node-toybox/io'),
    async = require('node-toybox/async'),
    debug = require('debug')('express-webapp-assets'),
    DEBUG = debug.enabled;

/**
 * @typedef {object} AssetsConfig
 * @property {string} src
 * @property {string} dst
 * @property {array.<string>} [includes]
 * @property {object.<string,*>} [helpers]
 * @property {object.<string,function>} [validators]
 * @property {object.<string,function>} [filters]
 * @property {object.<string,function>} [compressors]
 */

var
    DEF_CONFIG = {};

/**
 *
 * @param {AssetsConfig} [config]
 * @constructor
 */
function Assets(config) {
    if (!(this instanceof Assets)) {
        return new Assets(config);
    }

    this.config = _.merge({
        src: './assets',
        dst: '/tmp/assets',
        includes: [], //['bower_components', 'node_modules'],
        helpers: {
            PI: Math.PI,
            generatedAt: function () {
                return Date.now();
            }
        },
        validators: {
            //html: require('../validator/html'),
            //css: require('../validator/css'),
            //js: require('../validator/jshint')
        },
        filters: {
            html: require('./filter/jade'),
            css: require('./filter/less'),
            js: require('./filter/coffee')
        },
        compressors: {
            css: require('./filter/cssmin'),
            js: require('./filter/uglifyjs')
        },
        env: process.env.NODE_ENV || 'development'
    }, config);

    DEBUG && debug('create assets...', this.config);

    var self = this;
    this.config.helpers.js = function (name) {
        if (self.config.env !== 'development') {
            return '<script src="' + name + '"></script>';
        }
        fs.readFileSync(self._getUncompressedFile(name), 'utf8').split('\n').map(function (name) {
            name = self._getUncompressedFile(name);
            return '<script src="' + name + '"></script>';
        }).join('\n');
    };
    this.config.helpers.css = function (name) {
        if (self.config.env !== 'development') {
            return '<link rel="stylesheet" href="' + name + '" />';
        }
        fs.readFileSync(self._getUncompressedFile(name), 'utf8').split('\n').map(function (name) {
            name = self._getUncompressedFile(name);
            return '<link rel="stylesheet" href="' + name + '" />';
        }).join('\n');
    };
}

Assets.prototype._getFilter = function (name) {
    var ext = path.extname(name);
    return this.config.filters[ext.substring(1)];
};

Assets.prototype._getCompressor = function (name) {
    var ext = path.extname(name);
    return this.config.compressors[ext.substring(1)];
};

// foo.min.ext --> foo.ext
// foo.ext --> foo.ext
Assets.prototype._getUncompressedFile = function (name) {
    if (name.lastIndexOf('.min.') === -1) {
        return name;
    }
    return name.replace('.min.', '.');
};

// foo.ext --> foo.min.ext
// foo.min.ext --> foo.min.ext
Assets.prototype._getCompressedFile = function (name) {
    if (name.lastIndexOf('.min.') != -1) {
        return name;
    }
    var ext = path.extname(name);
    return name.replace(ext, '.min' + ext);
};

Assets.prototype._hitCache = function (src, dst, callback) {
    return callback(false);
    //if (this.config.noCache) {
    //    return callback(false);
    //}
    //return io.isFileNewer(dst, src, function (hit) {
    //    callback(hit);
    //});
};

Assets.prototype.copy = function (src, dst, callback) {
    DEBUG && debug('try copy...', src, '-->', dst);
    return io.copyFile(src, dst, function (err) {
        DEBUG && debug('copy result', err, src, '-->', dst);
        callback(err, !err && dst);
    });
};

Assets.prototype.include = function (dirs, name, dst, callback) {
    DEBUG && debug('try include...', name, '-->', dst);
    if (dirs.length === 0) {
        return callback(new Error('include error'));
    }
    var self = this;
    var src = path.join(dirs[0], name);
    fs.exists(src, function (exists) {
        if (!exists) {
            DEBUG && debug('include skip', name, '-->', src, '-->', dst);
            return self.include(dirs.slice(1), name, dst, callback);
        }
        self.copy(src, dst, function (err) {
            DEBUG && debug('include result', err, name, '-->', src, '-->', dst);
            return callback(err, !err && dst);
        });
    });
};

Assets.prototype.bundle = function (src, dst, callback) {
    DEBUG && debug('bundle...', src, '-->', dst);
    var self = this;
    fs.readFile(src + '.bundle', 'utf8', function (err, data) {
        if (err) {
            return callback(new Error('bundle'));
        }
        var assetNames = data.split('\n').filter(function (line) {
            return line.length > 0 && line.charAt(0) !== '#';
        });
        async.reduce(assetNames, function (files, assetName, next) {
            self.resolve(assetName, function (err, file) {
                DEBUG && debug('bundle resolve result', err, assetName, '-->', file);
                if (err) {
                    return next(err);
                }
                files.push(file);
                next(null, files);
            });
        }, function (err, files) {
            if (err) {
                DEBUG && debug('bundle resolve err', err);
                return callback(err);
            }
            DEBUG && debug('bundle concat', src, '-->', files, '-->', dst);
            return io.concatFiles(files, dst, function (err) {
                DEBUG && debug('bundle result', err, src, '-->', files, '-->', dst);
                callback(err, !err && dst);
            });
        }, []);
    });
};

Assets.prototype.filter = function (src, dst, callback) {
    DEBUG && debug('filter...', src, '-->', dst);
    var filter = this._getFilter(src);
    if (typeof filter !== 'function') {
        return callback(new Error('filter'));
    }
    var self = this;
    io.createDirectory(path.dirname(dst), function (err) {
        if (err) {
            return callback(err);
        }
        return filter(src + '.' + filter.ext, dst, self.config.helpers, function (err) {
            DEBUG && debug('filter result', err, src, '-->', filter.ext, '-->', dst);
            callback(err, !err && dst);
        });
    });
};

Assets.prototype.compress = function (src, dst, callback) {
    if (src === dst) {
        DEBUG && debug('compress skip', src, '===', dst);
        return callback(null, dst);
    }
    DEBUG && debug('compress...', src, '-->', dst);
    var compressor = this._getCompressor(src);
    if (typeof compressor !== 'function') {
        return callback(new Error('compress'));
    }
    var self = this;
    io.createDirectory(path.dirname(dst), function (err) {
        if (err) {
            return callback(err);
        }
        compressor(src, dst, self.config.helpers, function (err) {
            DEBUG && debug('compress result', err, src, '-->', dst);
            callback(err, !err && dst);
        });
    });
};

// /SRC/test.html.jade --> /test.html
// /SRC/test.css.less --> /test.css, /test.min.css
// /SRC/test.css.bundle --> /test.css, /test.min.css
// /SRC/test.jpg --> /test.jpg
Assets.prototype._getPossibleNames = function (file) {
    var assetNames = [];
    // --> /test.css.less, /test.jpg
    var name = path.relative(this.config.src, file);
    // --> .less, .jpg
    var ext = path.extname(name);
    // --> /test.css, /test
    var src = name.slice(0, -ext.length);
    if (src.indexOf('.') !== -1 && this._getFilter(src)) {
        // filter supported asset
        // ==> /test.css
        assetNames.push(src);
        name = src;
    } else {
        // copy only asset
        // ==> /test.jpg
        assetNames.push(name);
    }
    if (this._getCompressor(name)) {
        // compressor supported asset
        // ==> /test.min.css
        assetNames.push(this._getCompressedFile(name));
    }
    return assetNames;
};

// /test.html --> /SRC/test.html, /SRC/test.css.jade, /INCLUDE/test.html
// /test.css --> /SRC/test.css, /SRC/test.css.bundle, /SRC/test.css.less, /INCLUDE/test.css
// /test.min.css --> /SRC/test.min.css, /SRC/test.css, /SRC/test.css.bundle, /SRC/test.css.less, /INCLUDE/test.min.css
// /test.jpg --> /SRC/test.jpg, /INCLUDE/test.jpg
Assets.prototype._getCandidateFiles = function (name) {
    var files = [
        path.join(this.config.src, name),
        path.join(this.config.src, name + '.bundle')
    ];
    if (this._getCompressor(name)) {
        var uncompressed = this._getUncompressedFile(name);
        if (uncompressed !== name) {
            files.push(path.join(this.config.src, uncompressed));
        }
    }
    var filter = this._getFilter(name);
    if (filter) {
        files.push(path.join(this.config.src, name + '.' + filter.ext));
    }
    this.config.includes.forEach(function (include) {
        files.push(path.join(include, name));
    });
    return files;
};

Assets.prototype.resolve = function (name, callback) {
    DEBUG && debug('resolve...', name);

    var src = path.join(this.config.src, name);
    var dst = path.join(this.config.dst, name);

    var assetName = this._getUncompressedFile(name);
    var assetSrc = path.join(this.config.src, assetName);
    var assetDst = path.join(this.config.dst, assetName);

    var self = this;
    this.copy(assetSrc, assetDst, function (err) {
        if (!err) {
            return self.compress(assetDst, dst, callback);
        }
        self.bundle(assetSrc, assetDst, function (err) {
            if (!err) {
                return self.compress(assetDst, dst, callback);
            }
            self.filter(assetSrc, assetDst, function (err) {
                if (!err) {
                    return self.compress(assetDst, dst, callback);
                }
                self.include(self.config.includes, name, dst, function (err) {
                    callback(err, !err && dst);
                });
            });
        });
    });
};

module.exports = Assets;
