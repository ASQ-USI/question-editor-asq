# question-editor-asq

Proof of concept for a question editor developed for the [ASQ](http://asq.inf.usi.ch/) web-app.

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


## Development workflow

### Serve / watch

```
gulp serve
```
This command will transpile your ES6 polymer components into ES5 and output two IP addresses: one you can use to locally test and another that can be used from devices connected to your network.



### Build & Vulcanize

```
gulp

```
if you would like to run a server from the dist folder
```
gulp serve:dist
```


### Electron
If you prefer to execute it as a standalone application you need one more thing

```
npm install electron-prebuilt -g
```

and run with
```
gulp && electron .
```


## Deployment

```
gulp dist
```

### Mount path
If you wish to mount the app in a specific path of your server, set the `MOUNT_PATH` ENV variable to the path. You can also use a `.env` file in the root of the project which will get picked up automatically eg:

```bash
# .env
MOUNT_PATH=/my-mount-path
```