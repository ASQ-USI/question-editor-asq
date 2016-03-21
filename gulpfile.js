'use strict';

const gulp = require('gulp'),
  polylint = require('gulp-polylint'),
  del = require('del'),
  browserSync = require('browser-sync').create(),
  reload = browserSync.reload;
var $ = require('gulp-load-plugins')();


gulp.task('default', ['serve-lint'], function() {
  // place code for your default task here
});

// linter for polymer
gulp.task('polylint', function() {
  return gulp.src('app/elements/**/*.html')
    .pipe(polylint())
    .pipe(polylint.reporter(polylint.reporter.stylishlike));
});

// Auto reload server with linter for polymer
gulp.task('serve-lint',['polylint'], function() {
  browserSync.init({
      server: "./app",
      notify: false
  });
gulp.watch("app/**/*.html", ['polylint'])
})

// Auto reload server without linter for polymer (faster)
gulp.task('serve-no-lint',[], function() {
  browserSync.init({
      server: "./app",
      notify: false
  });
gulp.watch(["app/**/*.html"], [reload])
})


gulp.task('clean', function () {
  return del(['app/es2015/**/*']).then(paths => {
	// console.log('Deleted files and folders:\n', paths.join('\n'));
});
})


gulp.task('js', function() {
  return gulp.src(['app/**/*.{js,html}', '!app/bower_components/**/*'])
  .pipe($.sourcemaps.init())
  .pipe($.if('*.html', $.crisper({scriptInHead: false}))) // Extract JS from .html files
  .pipe($.if('*.js', $.babel({
    presets: ['es2015']
  })))
  .pipe($.sourcemaps.write('.'))
  .pipe(gulp.dest('.tmp/'))
  .pipe(gulp.dest('./app/es2015'));
});
