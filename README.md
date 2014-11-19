express-webapp-assets
=====================

Webapp Assets Middleware/Server/Generator for [Express].

`express-webapp-assets` make easy to write *single page/front-end* webapp using [preprocessors].

While development,
- It works as a **middleware** for API server written in [Express]/[Node.js].
- or It works as a **simple http server** for external API server written in other frameworks/languages.

After development,
- It **generates static files** for all assets written in [preprocessors].
- And the generated files could be served with high-performance [static-content http servers].
- No annoying changes and/or verbose deploy script to switch development/production assets.

>for practical example, see [express-webapp-assets-seed](http://github.com/iolo/express-webapp-assets-seed)

usage
-----

### middleware

While development,
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

To run server, use `--server` or `-S` argument:
```
$ express-webapp-asset --server
```

> NOTE: this is **NOT** intended for production use. use **generator** and deploy to [static-content http servers].

### generator

After development,
- It **generates static files** for all assets written in [preprocessors].
- And the generated files could be served with high-performance [static-content http servers].
- No annoying modifications and/or verbose deploy script to switch development/production assets.

To install node.js module in global(or local if you want):
```
$ npm install express-webapp-assets -g
```

To run generator, use `--generator` or `-G` argument:
```
$ express-webapp-assets --generator --env=production
```

configurations
--------------

Configurations could be a file(`_asset.json` or a `./_asset` property in `package.json`:

```javascript
{
  host: 'localhost', // server mode only
  port: 3000, // server mode only
  root: 'public', // server mode only
  src: 'assets',
  dst: '/build/public/asset',
  helpers: { }, // passed to preprocessors
  filters: { }, // custom filters
  env: 'development'  // 'development', 'staging', 'production' or else
}
```

To specify configuration file, use `--config` or `-C` argument:
```
$ express-webapp-asset --config=asset_config.json
```

helpers
-------

There are helpers for preprocessors.

### js

with `test.js.concat`
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

but in **NOT** 'development' env, it generates `test.html` and `test.min.js`(or `test.css`):
```html
<html>
  <head>
    <script src="test.min.js"></script>
```

### css

with `test.css.concat`
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
    - concat: generic asset to concatenate assets.
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
