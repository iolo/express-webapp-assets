'use strict';

/** @module express-webapp-assets/cli */

var
    path = require('path'),
    _ = require('lodash'),
    minimist = require('minimist'),
    debug = require('debug')('express-webapp-assets:cli'),
    DEBUG = debug.enabled;

/**
 *
 * @param {array.<string>} argv command line arguments
 */
module.exports = function (argv) {
    var args = minimist(argv);
    var cliConfig = {
        host: args.host || args.h,
        port: args.port || args.p,
        root: args.root || args.r,
        mount: args.mount || args.m,
        src: args.src || args.s,
        dst: args.dst || args.d,
        includes: _.compact((args.includes || args.i || '').split(',')),
        env: args.env
    };
    DEBUG && debug('cli', args, '-->', cliConfig);

    var pkgConfig = {};
    var pkgFile = path.resolve(process.cwd(), './package.json');
    try {
        DEBUG && debug('load config from ', pkgFile);
        pkgConfig = require(pkgFile)._assets;
    } catch (e) {
        DEBUG && debug('failed to load config from ', pkgFile, e);
    }
    DEBUG && debug('pkg config=', pkgConfig);

    var fileConfig = {};
    var configFile = args.config || args.C || './_assets.json';
    if (configFile) {
        configFile = path.resolve(process.cwd(), configFile);
        try {
            DEBUG && debug('load config from ', configFile);
            fileConfig = require(configFile);
        } catch (e) {
            DEBUG && debug('failed to load config from ', configFile, e);
        }
    }
    DEBUG && debug('file config=', fileConfig);

    var config = _.merge(fileConfig, pkgConfig, cliConfig);
    DEBUG && debug('merged config=', config);

    require('fs').createReadStream(__dirname + '/banner.txt').pipe(process.stdout);

    if (args.generator || args.G) {
        require('./generator')(config, function () {
            DEBUG && debug('finish generator...', arguments);
        });
    } else if (args.server || args.S) {
        require('./server')(config, function (config) {
            DEBUG && debug('server ready...');
            if (args.open || args.o) {
                var url = 'http://' + config.host + ':' + config.port + '/index.html';
                DEBUG && debug('open browser...', url);
                require('child_process').spawn('open', [url]);
            }
        });
    } else {
        require('fs').createReadStream(__dirname + '/usage.txt').pipe(process.stdout);
    }
};
