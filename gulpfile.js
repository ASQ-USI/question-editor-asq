'use strict';

const gulp = require('gulp'),
  browserSync = require('browser-sync').create();


gulp.task('default', function() {
  // place code for your default task here
});


// server
gulp.task('serve', function() {
  browserSync.init({
      server: "./app",
      notify: false
  });
// gulp.watch("app/projects.json", ['react']);
gulp.watch("app/**/*.html").on('change', browserSync.reload);
})
