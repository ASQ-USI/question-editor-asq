'use strict';

const gulp = require('gulp'),
  polylint = require('gulp-polylint'),
  del = require('del'),
  jshint = require('gulp-jshint'),
  extract = require("gulp-html-extract"),
  htmlreplace = require('gulp-html-replace'),
  runSequence = require('run-sequence'),
  jscs = require('gulp-jscs'),
  browserSync = require('browser-sync').create(),
  $ = require('gulp-load-plugins')(),
  reload = browserSync.reload;


gulp.task('default', function() {
  // place code for your default task here
  runSequence('clean', 'js', 'vulcanize')
});

// create a server with live reload
gulp.task('serve',['bowertotmp', 'js'], function() {
  browserSync.init({
      server: "./.tmp",
      notify: false
  });
  gulp.watch(["app/styles/**/*.css"], ['copyCss', reload])
  gulp.watch(["app/**/*.html"], ['js',reload])
})


// create a serever from distribution folder
gulp.task('serve:dist', function() {
  runSequence('clean','js', 'vulcanize', ()=>{
    browserSync.init({
        server: "./dist",
        notify: false
    });
  })

})


// delete .tmp and dist folder
gulp.task('clean', function () {
  return del([
    './dist',
    '.tmp'
  ]).then(paths => {});
})

// transpile ES6 to ES5
gulp.task('js',['copyCss'],function() {
  return gulp.src(['app/**/*.{js,html,svg}', '!app/bower_components/**/*'])
  .pipe($.sourcemaps.init())
  .pipe($.if('*.html', $.crisper({scriptInHead: false}))) // Extract JS from .html files
  .pipe($.if('*.js', $.babel({
    presets: ['es2015']
  })))
  .pipe($.sourcemaps.write('.'))
  .pipe(gulp.dest('./.tmp'))
  // .pipe(gulp.dest('./dist'));
});

// optimize polymer components for distribution
gulp.task('vulcanize',['bowertotmp'], function () {
  gulp.src('./app/index.html')
  .pipe(htmlreplace({
        'app': '<link rel="import" href="./qea-main-app/qea-main-app.html">'
    }))
  .pipe(gulp.dest('./dist/'));

  gulp.src([
    'app/bower_components/{webcomponentsjs,platinum-sw,sw-toolbox,promise-polyfill}/**/*'
  ]).pipe(gulp.dest('./dist/bower_components'));

	return gulp.src('./.tmp/elements/qea-main-app/qea-main-app.html')
		.pipe($.vulcanize({
			stripComments: true,
      inlineCss: true,
      inlineScripts: true
		}))
		.pipe(gulp.dest('./dist/qea-main-app'));
});


// copy all bower_components in .tmp folder
gulp.task('bowertotmp', function () {

  gulp.src(['node_modules/redux/dist/redux.js'])
    .pipe(gulp.dest('.tmp/script/'));

 return gulp.src(['app/bower_components/**/*'])
   .pipe(gulp.dest('.tmp/bower_components/'));
});


// copy css files to dist and .tmp folder
gulp.task('copyCss', ()=>{
  return gulp.src(['app/styles/**/*'])
    .pipe(gulp.dest('./.tmp/styles/'))
    .pipe(gulp.dest('./dist/styles/'))
});


// linter for javascript
// TODO revolve bug that cause wrong line number in error message
//      correct number should be (line showned + line of script tag <script> - 1)
gulp.task('lint', function() {
  return gulp.src(['./app/elements/**/*.html','./app/elements/**/*.js'])
  .pipe($.if('*.html', $.htmlExtract()))
  .pipe(jshint({esversion: 6}))
  .pipe(jscs())
  .pipe($.jscsStylish.combineWithHintResults())
  .pipe(jshint.reporter('jshint-stylish'));
});
