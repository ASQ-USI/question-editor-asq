# Test
You need to [have web-component-tester](https://github.com/Polymer/web-component-tester) installed. To install:
```
npm install -g web-component-tester
```

## Add tests
If you want to create some tests import your elements from the `.tmp` folder in order to have the transpiled ES5 version of them.

## Run tests
### Short method
Move into the root folder and just type
```
$ npm test
```

### Long method
First you need to transpile to ES5
```
$ gulp
```

If you want to run all test on all the browser installed on your system, move into the app folder and execute
```
$ wct
```

If you prefer to execute them from browser
move in the root folder of the project
```
$ polyserve
```
and visit this link http://localhost:8080/components/editor-project/app/test/
