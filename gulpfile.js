'use strict';

const gulp = require('gulp'),
  polylint = require('gulp-polylint'),
  browserSync = require('browser-sync').create();


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
gulp.task('serve-no-lint', function() {
  browserSync.init({
      server: "./app",
      notify: false
  });
gulp.watch("app/**/*.html").on('change', browserSync.reload)
})
