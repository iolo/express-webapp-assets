/* global describe,it,before,beforeEach,after,afterEach */
'use strict';

var
    assert = require('assert'),
    fs = require('fs'),
    Assets = require('../lib/assets'),
    debug = require('debug')('test');

describe('assets', function () {
    it('should be created as function', function () {
        /* jshint newcap: false */
        var assets = Assets({});
        /* jshint newcap: true */
        assert(assets instanceof Assets);
    });
    it('should be created as constructor', function () {
        var assets = new Assets({});
        assert(assets instanceof Assets);
    });

    var SRC_DIR = __dirname + '/fixtures/src';
    var DST_DIR = __dirname + '/fixtures/dst';
    var GEN_DIR = '/tmp/assets-test-dst';
    var CONFIG = {
        src: SRC_DIR,
        dst: GEN_DIR,
        includes: [__dirname + '/fixtures/inc1', __dirname + '/fixtures/inc2']
    };

    var assets;
    before(function (done) {
        require('child_process').exec('rm -rf ' + GEN_DIR, function () {
            assets = new Assets(CONFIG);
            done();
        });
    });

    function assertNotFoundFn(name) {
        return function (done) {
            assets.resolve('/' + name, function (err) {
                debug('********assertNotFoundFn:', name);
                debug('********', arguments);
                assert(err);
                assert(!fs.existsSync(GEN_DIR + '/' + name));
                done();
            });
        };
    }

    function assetsEqualFn(name) {
        return function (done) {
            assets.resolve('/' + name, function (err, file) {
                debug('********assetsEqualFn:', name);
                debug('********', arguments);
                assert.ifError(err);
                assert.equal(file, GEN_DIR + '/' + name);
                assert.equal(fs.readFileSync(file, 'utf8'), fs.readFileSync(DST_DIR + '/' + name, 'utf8'));
                done();
            });
        };
    }

    it('should not found', assertNotFoundFn('__not_found__'));
    it('should not found min.html', assertNotFoundFn('test.min.html'));
    //it('should not found source html.jade', assertNotFoundFn('test.html.jade'));
    //it('should not found source css.less', assertNotFoundFn('test.css.less'));
    //it('should not found source js.coffee', assertNotFoundFn('test.js.coffee'));
    //it('should not found source css.bundle', assertNotFoundFn('all.css.bundle'));
    //it('should not found source js.bundle', assertNotFoundFn('all.js.bundle'));

    it('should bypass', assetsEqualFn('test.txt'));
    it('should render jade', assetsEqualFn('test.html'));
    it('should render less', assetsEqualFn('test.css'));
    it('should render coffee', assetsEqualFn('test.js'));
    it('should render less and minimize', assetsEqualFn('test.min.css'));
    it('should render coffee and minimize', assetsEqualFn('test.min.js'));
    it('should concat css', assetsEqualFn('all.css'));
    it('should concat js', assetsEqualFn('all.js'));
    it('should concat css and minimize', assetsEqualFn('all.min.css'));
    it('should concat js and minimize', assetsEqualFn('all.min.js'));
});