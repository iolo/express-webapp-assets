express-webapp-assets
=====================

Webapp Assets Middleware/Server/Generator for [Express].

`express-webapp-assets` is a development tool to develop *single page/front-end* webapp using [preprocessors](#preprocessors).

>For practical example, see [express-webapp-assets-seed](http://github.com/iolo/express-webapp-assets-seed)

introduction
------------

* It is **NOT** a server application.
* It is a **development tool** with built-in http server.

* In development phase,
    - It works as an embedded **middleware** for local API server written in [Express]/[Node.js].
    - or It works as a sepratated **simple http server** for external API server written in other frameworks/languages.

* In deployment phase:
    - It **generates static files** for all assets written in [preprocessors](#preprocessors).
    - And the generated files could be served with high-performance [static-content http servers](#static-content-http-servers).
    - No annoying changes and/or verbose deploy script to switch development/production assets.

In the other words,
it does copy, filter(render/compile/.../whatever), bundle(merge) and compress assets for you **just in time** or **in batch**.

For example, it does these tasks instead of you(or your [grunt]/[gulp] script):
```
$ less foo.less > foo.css
$ cssmin foo.css > foo.min.css
$ less bar.less > bar.css
$ cssmin bar.css > bar.min.css
$ coffee-script baz.coffee > bar.js
$ uglify-js baz.js > bar.min.js
$ coffee-script qux.coffee > qux.js
$ uglify-js qux.js > qux.min.js
$ cat foo.css bar.css > all.css
$ cssmin all.css > all.min.css
$ cat baz.js qux.js > all.js
$ uglify-js all.js > all.min.js
```
and replace
```html
<link rel="stylesheet" href="foo.css" />
<link rel="stylesheet" href="bar.css" />
<script src="baz.js"></script>
<script src="qux.js"></script>
```
into 
```html
<link rel="stylesheet" href="all.min.css" />
<script src="all.min.js"></script>
```

usage
-----

### middleware

To develop webapp working with local API server written in [Express]/[Node.js].

install node.js module:
```
$ npm install express-webapp-assets --save-dev
```

configure middleware:
```javascript
express()
    ...
    .use('/assets', require('express-webapp-assets')({src:'public/assets', ... configurations ... }))
    .use('/api/v1', ... your api routes ...)
    ...
```

> NOTE: this is **NOT** intended for production use. use **generator** and deploy to your [static-content http servers](#static-content-http-servers).

### server

To develop webapp working with external API server written in other frameworks/languages.

install node.js module global(or local if you want):
```
$ npm install express-webapp-assets -g
```

run server, use `--server` or `-S` CLI option:
```
$ express-webapp-asset --server
```

> NOTE: this is **NOT** intended for production use. use **generator** and deploy to your [static-content http servers](#static-content-http-servers).

### generator

It **generates static files** for all assets written in [preprocessors](#preprocessors).

And the generated files could be served with high-performance [static-content http servers](#static-content-http-servers).

No annoying modifications and/or verbose deploy script to switch development/production assets.

install node.js module in global(or local if you want):
```
$ npm install express-webapp-assets -g
```

run generator, use `--generator` or `-G` CLI option:
```
$ express-webapp-assets --generator --env=production
```

configurations
--------------

Configurations could be a `./_assets.json` file or a `_asset` property in `package.json`:

```javascript
{
  host: 'localhost', // server mode only
  port: 3000, // server mode only
  root: 'public', // server mode only
  mount: '/', // server mode only
  src: 'public',
  dst: '/build/public',
  helpers: { }, // passed to preprocessors
  filters: { }, // custom filters
  env: 'development'  // 'development', 'staging', 'production' or else
}
```

To specify configuration file, use `--config` or `-C` CLI option:
```
$ express-webapp-asset --config=asset_config.json
```

resolving assets
----------------

1. find with base name and extension.
    - `foo.js` or `foo.min.js` resolved to `foo.js` file.
2. find with `.bundle` extension.
    - `foo.js` or `foo.min.js` resolved to `foo.js.bundle` file.
    - `foo.css` or `foo.min.css` resolved to `foo.css.bundle` file.
    - a bundle file is references other assets(not files) line by line
    - all assets in a bundle file are resolved(**RECURSIVE**) and merged into a single file.
3. find with with preprocessor specific extension.
    - `foo.html` resolved to `foo.html.jade`
    - `foo.css` or `foo.min.css` resolved to `foo.js.less`
    - `foo.js` or `foo.min.js` resolved to `foo.js.coffee`
4. compress it if asset name contains infix `.min` and compressable format(js, css).
5. otherwise, find in `includes` directories.
    - above procedures(bundle/filter/compress) are **NOT** applied.

for example,

* asset `SRC/test.html` or `SRC/test.html.jade`

```jade
...
link(rel="stylesheet",href="foo.css")
link(rel="stylesheet",href="bar.min.css")
link(rel="stylesheet",href="bootstrap-all.min.css")
script(src="baz.js")
script(src="qux.min.s")
script(src="bootstrap-all.min.js")
```

* will generate/serve `DST/test.html`

```html
<link rel="stylesheet" href="foo.css" />
<link rel="stylesheet" href="bar.min.css" />
<link rel="stylesheet" href="bootstrap-all.min.css" />
<script src="baz.js"></script>
<script src="qux.min.js"></script>
<script src="bootstrap-all.min.js"></script>
```

* asset `SRC/bootstrap-all.js.bundle` 

```
# all bootstrap scripts
jquery/dist/jquery.min.js
bootstrap/dist/js/bootstrap.min.js
```

* will generate/serve `DST/boostrap-all.js` and `DST/bootstrap-all.min.js`

* asset `SRC/bootstrap-all.css.bundle`

```
# all bootstrap styles
bootstrap/dist/css/bootstrap.min.css
bootstrap/dist/css/bootstrap-theme.min.css
```

* will generate/serve `DST/bootstrap-all.css` and `DST/bootstrap-all.min.css`

* asset `SRC/foo.css` or `SRC/foo.css.less` will generate/serve `DST/foo.css` and `DST/foo.min.css`.
* asset `SRC/bar.css` or `SRC/bar.css.less` will generate/serve `DST/bar.css` and `DST/bar.min.css`.
* asset `SRC/baz.js` or `SRC/baz.js.coffee` will generate/serve `DST/baz.css` and `DST/baz.min.css`.
* asset `SRC/qux.js` or `SRC/qux.js.coffee` will generate/serve `DST/qux.css` and `DST/qux.min.css`.
* and so on...

helpers
-------

There are helpers for preprocessors.

### js

for example, there are `test.js.bundle`
```
foo.coffee.js
bar.js
```

and `test.html.jade` using `test.min.js`(or `test.js`):
```jade
html
  head
    !=js('test.min.js')
```

in 'development' env, it generates/serves `test.html`, `foo.js` and `bar.js`:
```html
<html>
  <head>
    <script src="foo.js"></script>
    <script src="bar.js"></script>
```

but in **NOT** 'development' env, it generates/serves `test.html` and `test.min.js`(or `test.js`):
```html
<html>
  <head>
    <script src="test.min.js"></script>
```

### css

for example, there are `test.css.bundle`
```
foo.less.css
bar.css
```

and `test.html.jade` using `test.min.css`(or `test.css`):
```jade
html
  head
    !=css('test.min.css')
```

in 'development' env, it generates/serves `test.html` and `foo.css` and `bar.css`:
```html
<html>
  <head>
    <link rel="stylesheet" href="foo.css" />
    <link rel="stylesheet" href="bar.css" />
```

but in **NOT** 'development' env, it generates/serves `test.html` `test.min.css`(or `test.css`):
```html
<html>
  <head>
    <link rel="stylesheet" href="test.min.css" />
```

preprocessors
-------------

* html
    - [jade](http://jade-lang.com)
    - TODO: [ejs](http://www.embeddedjs.com)
    - TODO: [mustache](http://mustache.github.io)
    - [report issue] or [pull request] ;)
* css
    - [cssmin](https://github.com/jbleuzen/node-cssmin) for *.min.css
    - [less](http://lesscss.org)
    - TODO: [sass](http://sass-lang.com)
    - TODO: [compass](http://compass-style.org)
    - TODO: [stylus](http://learnboost.github.io/stylus/)
    - [report issue] or [pull request] ;)
* js
    - [uglifyjs](http://lisperator.net/uglifyjs/) for *.min.js
    - [coffee](http://coffeescript.org)
    - TODO: [typescript](http://www.typescriptlang.org)
    - TODO: [dart](https://www.dartlang.org)
    - [report issue] or [pull request] ;)
* others
    - [report issue] or [pull request] ;)

static-content http servers
---------------------------

* package
    - [Apache](http://httpd.apache.org) - FOSS, fast and stable
    - [Nginx](http://nginx.org) - FOSS, very fast and stable
    - [Cherokee](http://cherokee-project.com) - FOSS, very very fast
    - [G-WAN](http://gwan.com) - Commercial but extremely fast
    - ...
* cloud
    - [GitHub Pages](https://pages.github.com)
    - [Amazon S3](http://aws.amazon.com/s3/)
    - ...

*may the **SOURCE** be with you...*
