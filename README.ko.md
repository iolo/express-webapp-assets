express-webapp-assets
=====================

[English](README.md)

[Express]를 위한 웹앱 애센 미들웨어/서버/생성기.

`express-webapp-assets`은 다양한 [전처리기](#preprocessors)를 사용하는 *단일페이지/프론트엔드* 웹앱 개발 도구입니다.

>실용적인 예제는, [express-webapp-assets-seed](http://github.com/iolo/express-webapp-assets-seed)를 참조하세요.

소개
----

* 이것은 서버 어플리케이션이 **아닙니다**.
* 이 녀석은 간단한 웹서버를 내장한 **개발 도구**입니다.

* 개발하는 동안에는,
    - [Express]/[Node.js]로 개발된 로컬 API 서버에 내장된 **미들웨어**로 동작합니다.
    - 또는, 다른 프레임웍/언어로 개발된 외부 API 서버와 분리된 **단순 웹서버**로 동작합니다.

* 배포하는 동안에는,
    - [전처리기](#preprocessors)로 작성된 에셋으로 부터 **정적 파일을 생성**합니다.
    - 생성된 정적 파일들은 고성능의 [정적 컨텐츠 웹서버](#static-content-http-servers)로 서비스할 수 있죠.
    - 에셋을 개발/배포하는 위해 짜증스러운 변경 작업이나 장황한 배포 스크립트가 필요없습니다.

바꿔 말하면,
이 녀석은 **그 때 그 때** 혹은 **배치**로 에셋을 복사하고, 필터(렌러링/컴파일/.../뭐가됐건), 번들(병합) 그리고 압축합니다.

예를 들면 개발자(혹은 [grunt]/[gulp] 스크립트) 대신 이런 일들을 합니다:
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
그리고 이 녀석을
```html
<link rel="stylesheet" href="foo.css" />
<link rel="stylesheet" href="bar.css" />
<script src="baz.js"></script>
<script src="qux.js"></script>
```
이렇게 바꾸는 일도...
```html
<link rel="stylesheet" href="all.min.css" />
<script src="all.min.js"></script>
```

사용법
------

### 미들웨어

[Express]/[Node.js]로 작성된 로컬 API 서버를 이용하는 웹앱을 개발하고 있다면,

node.js 모듈을 설치하고:
```
$ npm install express-webapp-assets --save-dev
```

미들웨어를 설정합니다:
```javascript
express()
    ...
    .use('/assets', require('express-webapp-assets')({src:'public/assets', ... configurations ... }))
    .use('/api/v1', ... your api routes ...)
    ...
```

> 주의: 이 녀석은 실 서비스용이 **아닙니다**. **생성기** 사용하고, [정적 컨텐츠 웹서버](#static-content-http-servers).

### 서버

다른 프레임웍/언어로 개발된 외부 API 서버를 이용하는 웹앱을 개발하고 있다면,

node.js 모듈을 전역(원한다면 로컬)으로 설치하고:
```
$ npm install express-webapp-assets -g
```

`--server` 또는 `-S` 명령행 옵션으로 서버를 실행합니다:
```
$ express-webapp-asset --server
```

> 주의: 이 녀석은 실 서비스용이 **아닙니다**. **생성기** 사용하고, [정적 컨텐츠 웹서버](#static-content-http-servers).

### 생성기

[전처리기](#preprocessors)로 작성된 에셋으로 부터 **정적 파일을 생성**합니다.

생성된 정적 파일들은 고성능의 [정적 컨텐츠 웹서버](#static-content-http-servers)로 서비스할 수 있죠.

에셋을 개발/배포하는 위해 짜증스러운 변경 작업이나 장황한 배포 스크립트가 필요없습니다.

node.js 모듈을 전역(원한다면 로컬)으로 설치하고:
```
$ npm install express-webapp-assets -g
```

`--generator` 또는 `-G` 명령행 옵션으로 생성기를 실행합니다:
```
$ express-webapp-assets --generator --env=production
```

설정
----

`./_assets.json` 파일이나 `package.json` 파일의 `_assets` 속성으로 설정합니다:

```javascript
{
  host: 'localhost', // 서버 모드 전용
  port: 3000, // 서버 모드 전용
  root: 'public', // 서버 모드 전용
  mount: '/', // 서버 모드 전용
  src: 'public',
  dst: '/build/public',
  helpers: { }, // 전처리기로 전달할 속성
  filters: { }, // 커스터 필터 설정
  env: 'development'  // 'development', 'staging', 'production' 등등
}
```

`--config` 나 `-C` 명령행 옵션으로 설정 파일을 지정합니다:
```
$ express-webapp-asset --config=asset_config.json
```

에셋 처리 과정
--------------

1. 기본 이름(확장자를 뺀)과 확장자로 검색합니다.
    - `foo.js` 나 `foo.min.js` 는 `foo.js` 파일.
2. `.bundle` 확장자로 검색
    - `foo.js` 나 `foo.min.js` 는 `foo.js.bundle` 파일.
    - `foo.css` 나 `foo.min.css` 는 `foo.css.bundle` 파일.
    - 번들 파일은 다른 에셋(파일 아님)을 참조하는 여러 행으로 구성됩니다.
    - 번들 파일에 포함된 에셋이 모두 처리되면(**재귀적으로**) 결과 파일들을 단일 파일로 병합합니다.
3. 전처리기 고유의 확장자로 검색
    - `foo.html` 는  `foo.html.jade` 파일.
    - `foo.css` 나 `foo.min.css` 는 `foo.js.less` 파일.
    - `foo.js` 나 `foo.min.js` 는 `foo.js.coffee` 파일.
4. 에셋 이름 중간에 `.min`이 있고, 압축할 수 있는 형식이면(js, css) 압축합니다.
5. 일치하는 파일이 없으면 `includes` 디렉토리를 검색합니다.
    - 위의 절차(bundle/filter/compress)들은 적용되지 **않습니다**.

예를 들어,

* `SRC/test.html`나 `SRC/test.html.jade` 에셋은

```jade
...
link(rel="stylesheet",href="foo.css")
link(rel="stylesheet",href="bar.min.css")
link(rel="stylesheet",href="bootstrap-all.min.css")
script(src="baz.js")
script(src="qux.min.s")
script(src="bootstrap-all.min.js")
```

* `DST/test.html`을 생성/서비스합니다

```html
<link rel="stylesheet" href="foo.css" />
<link rel="stylesheet" href="bar.min.css" />
<link rel="stylesheet" href="bootstrap-all.min.css" />
<script src="baz.js"></script>
<script src="qux.min.js"></script>
<script src="bootstrap-all.min.js"></script>
```

* `SRC/bootstrap-all.js.bundle` 에셋은

```
# all bootstrap scripts
jquery/dist/jquery.min.js
bootstrap/dist/js/bootstrap.min.js
```

* `DST/boostrap-all.js`와 `DST/bootstrap-all.min.js`을 생성/서비스합니다.

* `SRC/bootstrap-all.css.bundle` 에셋은

```
# all bootstrap styles
bootstrap/dist/css/bootstrap.min.css
bootstrap/dist/css/bootstrap-theme.min.css
```

* `DST/bootstrap-all.css`와 `DST/bootstrap-all.min.css`을 생성/서비스합니다.

* `SRC/foo.css`나 `SRC/foo.css.less` 에셋은 `DST/foo.css`와 `DST/foo.min.css`을 생성/서비스합니다.
* `SRC/bar.css`나 `SRC/bar.css.less` 에셋은 `DST/bar.css`와 `DST/bar.min.css`을 생성/서비스합니다.
* `SRC/baz.js`나 `SRC/baz.js.coffee` 에셋은 `DST/baz.css`와 `DST/baz.min.css`을 생성/서비스합니다.
* `SRC/qux.js`나 `SRC/qux.js.coffee` 에셋은 `DST/qux.css`와 `DST/qux.min.css`을 생성/서비스합니다.
* 기타 등등...

도우미
------

전처리기를 위한 도우미들이 있습니다.

### js

예를 들어, `test.js.bundle` 에셋이 있습니다:
```
foo.coffee.js
bar.js
```

`test.html.jade` 에셋이 `test.min.js`(또는 `test.js`)를 사용한다면:
```jade
html
  head
    !=js('test.min.js')
```

'development' 환경에서는, `test.html`, `foo.js`, `bar.js`를 생성/서비스합니다:
```html
<html>
  <head>
    <script src="foo.js"></script>
    <script src="bar.js"></script>
```

'development' 환경이 **아니라면***, `test.html`, `test.min.js`, `test.js`를 생성/서비스합니다:
```html
<html>
  <head>
    <script src="test.min.js"></script>
```

### css

예를 들어, `test.css.bundle` 에셋이 있습니다:
```
foo.less.css
bar.css
```

`test.html.jade`는 `test.min.css`(또는 `test.css`)를 사용한다면:
```jade
html
  head
    !=css('test.min.css')
```

'development' 환경에서는, `test.html`, `foo.css`, `bar.css`를 생성/서비스합니다:
```html
<html>
  <head>
    <link rel="stylesheet" href="foo.css" />
    <link rel="stylesheet" href="bar.css" />
```

'development' 환경이 **아니라면***, `test.html`, `test.min.css`, `test.css`를 생성/서비스합니다:
```html
<html>
  <head>
    <link rel="stylesheet" href="test.min.css" />
```

전처리기
--------

* html
    - [jade](http://jade-lang.com)
    - TODO: [ejs](http://www.embeddedjs.com)
    - TODO: [mustache](http://mustache.github.io)
    - [이슈생성] 또는 [플리퀘스트] ;)
* css
    - [cssmin](https://github.com/jbleuzen/node-cssmin) for *.min.css
    - [less](http://lesscss.org)
    - TODO: [sass](http://sass-lang.com)
    - TODO: [compass](http://compass-style.org)
    - TODO: [stylus](http://learnboost.github.io/stylus/)
    - [이슈생성] 또는 [플리퀘스트] ;)
* js
    - [uglifyjs](http://lisperator.net/uglifyjs/) for *.min.js
    - [coffee](http://coffeescript.org)
    - TODO: [typescript](http://www.typescriptlang.org)
    - TODO: [dart](https://www.dartlang.org)
    - [이슈생성] 또는 [플리퀘스트] ;)
* 기타
    - [이슈생성] 또는 [플리퀘스트] ;)

정적 컨텐츠 웹서버
-------------------

* 패키지
    - [Apache](http://httpd.apache.org) - FOSS, 빠르고 안정적
    - [Nginx](http://nginx.org) - FOSS, 매우 빠르고 안정적
    - [Cherokee](http://cherokee-project.com) - FOSS, 매우 매우 빠름
    - [G-WAN](http://gwan.com) - 상업용, 겁나 빠름
    - ...
* 클라우드
    - [GitHub Pages](https://pages.github.com)
    - [Amazon S3](http://aws.amazon.com/s3/)
    - ...

*may the **SOURCE** be with you...*
