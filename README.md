# ASQ-question-editor

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
gulp serve
```

If you prefer to execute it as a standalone application you need one more thing

```
npm install electron-prebuilt -g
```

and run with
`electron .`
