express-webapp-assets
=====================

Webapp Assets Middleware/Server/Generator for [Express].

`express-webapp-assets` make easy to write *single page/front-end* webapp using [preprocessors](#preprocessors).

In development phase,
- It works as a **middleware** for API server written in [Express]/[Node.js].
- or It works as a **simple http server** for external API server written in other frameworks/languages.

In deployment phase:
- It **generates static files** for all assets written in [preprocessors](#preprocessors).
- And the generated files could be served with high-performance [static-content http servers](#static-content-http-servers).
- No annoying changes and/or verbose deploy script to switch development/production assets.

>for practical example, see [express-webapp-assets-seed](http://github.com/iolo/express-webapp-assets-seed)

usage
-----

### middleware

In development phase,
- It works as a **middleware** for API server written in [Express]/[Node.js].

To install node.js module:
```
$ npm install express-webapp-assets --save-dev
```

To configure middleware:
```javascript
express()
    ...
    .use('/assets', require('express-webapp-assets')({src:'public/assets', ... configurations ... }))
    .use('/api/v1', ... your api routes ...)
    ...
```

> NOTE: this is **NOT** intended for production use. use **generator** and deploy to [static-content http servers].

### server

While development,
- It works as a **simple http server** for external API server written in other frameworks/languages.

To install node.js module global(or local if you want):
```
$ npm install express-webapp-assets -g
```

To run server, use `--server` or `-S` CLI option:
```
$ express-webapp-asset --server
```

> NOTE: this is **NOT** intended for production use. use **generator** and deploy to [static-content http servers].

### generator

In deployment phase,
- It **generates static files** for all assets written in [preprocessors](#preprocessors).
- And the generated files could be served with high-performance [static-content http servers](#static-content-http-servers).
- No annoying modifications and/or verbose deploy script to switch development/production assets.

To install node.js module in global(or local if you want):
```
$ npm install express-webapp-assets -g
```

To run generator, use `--generator` or `-G` CLI option:
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
4. for request with infix `.min`, compress the result it if possible. 
5. find in `includes` directories.
    - above procedures(bundle/filter/compress) are **NOT** applied.

for example,

* asset `SRC/test.html` or `SRC/test.html.jade` will generate/serve `DST/test.html`
    - SRC/test.html.jade
        ```jade
        ...
        link(rel="stylesheet",href="foo.css")
        link(rel="stylesheet",href="bar.min.css")
        link(rel="stylesheet",href="bootstrap-all.min.css")
        script(src="baz.js")
        script(src="qux.min.s")
        script(src="bootstrap-all.min.js")
        ```
    - DST/test.html
        ```html
        <link rel="stylesheet" href="foo.css" />
        <link rel="stylesheet" href="bar.min.css" />
        <link rel="stylesheet" href="bootstrap-all.min.css" />
        <script src="baz.js"></script>
        <script src="qux.min.js"></script>
        <script src="bootstrap-all.min.js"></script>
        ```
* asset `SRC/bootstrap-all.js.bundle` will generate/serve `DST/boostrap-all.js` and `DST/bootstrap-all.min.js`
    ```
    # all bootstrap scripts
    jquery/dist/jquery.min.js
    bootstrap/dist/js/bootstrap.min.js
    ```
* asset `SRC/bootstrap-all.css.bundle` will generate/serve `DST/bootstrap-all.css` and `DST/bootstrap-all.min.css`
    ```
    # all bootstrap styles
    bootstrap/dist/css/bootstrap.min.css
    bootstrap/dist/css/bootstrap-theme.min.css
    ```
* asset `SRC/foo.css` or `SRC/foo.css.less` will generate/serve `DST/foo.css` and `DST/foo.min.css`.
* asset `SRC/bar.css` or `SRC/bar.css.less` will generate/serve `DST/bar.css` and `DST/bar.min.css`.
* asset `SRC/baz.js` or `SRC/baz.js.coffee` will generate/serve `DST/baz.css` and `DST/baz.min.css`.
* asset `SRC/qux.js` or `SRC/qux.js.coffee` will generate/serve `DST/qux.css` and `DST/qux.min.css`.
* and so on...

helpers
-------

There are helpers for preprocessors.

### js

with `test.js.bundle`
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

in 'development' env, it generates `test.html` and `foo.js` and `bar.js`:
```html
<html>
  <head>
    <script src="foo.js"></script>
    <script src="bar.js"></script>
```

but in **NOT** 'development' env, it generates `test.html` and `test.min.js`(or `test.js`):
```html
<html>
  <head>
    <script src="test.min.js"></script>
```

### css

with `test.css.bundle`
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

in 'development' env, it generates `test.html` and `foo.css` and `bar.css`:
```html
<html>
  <head>
    <link rel="stylesheet" href="foo.css" />
    <link rel="stylesheet" href="bar.css" />
```

but in **NOT** 'development' env, it generates `test.html` `test.min.css`(or `test.css`):
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
    - [Apache](http://httpd.apache.org) - FOSS and fast and stable)
    - [Nginx](http://nginx.org) - FOSS and very fast and stable)
    - [Cherokee](http://cherokee-project.com) - FOSS and very very fast)
    - [G-WAN](http://gwan.com) - commercial but extremely fast)
    - ...
* cloud
    - [GitHub Pages](https://pages.github.com)
    - [Amazon S3](http://aws.amazon.com/s3/)
    - ...

*may the **SOURCE** be with you...*
