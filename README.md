# question-editor-asq

Proof of concept for a question editor developed for the [ASQ](http://asq.inf.usi.ch/) web-app

Installation
-------------

clone the repository

`git clone https://github.com/ASQ-USI/question-editor-asq.git`

install global dependencies

```
npm install -g bower
npm install -g gulp  
```

install local dependencies

```
npm install
bower install
```

run on browser

```
gulp
```
If you already have a [polymer linter](https://github.com/PolymerLabs/polylint)
in your editor you can use this command to have a faster reload

```
gulp serve-no-lint
```

If you prefer to execute it as a standalone application you need one more thing

```
npm install electron-prebuilt -g
```

and run with
`electron .`
