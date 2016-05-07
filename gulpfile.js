'use strict';

const gulp = require('gulp');
const plumber = require('gulp-plumber');
const runSequence = require('run-sequence');
const del = require('del');
const eslint = require('gulp-eslint');
const crisper = require('gulp-crisper');
const gulpif = require('gulp-if');
const vulcanize = require('gulp-vulcanize');
const babel = require('gulp-babel');
const htmlreplace = require('gulp-html-replace');
const replace = require('gulp-replace');
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;

// Utility functions
let ISDISTMODE = false;

gulp.task('default', () => {

});

// clean the bild direcories
gulp.task('clean', () => {
  return del(['.transpiled', 'distribution']);
});

// create a web server with live reload
gulp.task('serve', ['transpile'], () => {
  browserSync.init({
    server: ['.transpiled', './'],
    notify: false,
  });
  gulp.watch('app/**/*.{html, js}', ['transpile', reload]);
});

// create a web server with live reload and linting
gulp.task('serve:linter', ['transpile', 'linter'], () => {
  browserSync.init({
    server: ['.transpiled', './'],
    notify: false,
  });
  gulp.watch('app/**/*.{html, js}', ['transpile', 'linter', reload]);
});

// tranpile javascript
gulp.task('transpile', ['copyFiles'], () => {
  return gulp.src(['app/**/*.html', '!app/bower_components/**/*'])
    .pipe(gulpif(!ISDISTMODE, plumber()))
    .pipe(crisper({
      scriptInHead: false, // true is default
      onlySplit: false,
    }))
    .pipe(babel({
      presets: ['es2015'],
      only: '*.js',
    }))
    .pipe(gulpif(!ISDISTMODE, plumber.stop()))
    .pipe(gulp.dest('./.transpiled'));
});


// linter that use Google's rooles
gulp.task('linter', () => {
  const src = ['app/**/*.{html,js}', '!app/test/**/*'];
  if (ISDISTMODE) {
    src.push('gulpfile.js');
  }
  gulp.src(src)
  .pipe(eslint())
  .pipe(eslint.format())
  .pipe(gulpif(ISDISTMODE, eslint.failAfterError()));
});

gulp.task('dist', () => {
  ISDISTMODE = true;
  runSequence('clean', 'linter', 'transpile', 'vulcanize', 'copyFiles');
});

// optimize polymer compomponents
gulp.task('vulcanize', () => {
  return gulp.src('./.transpiled/elements/qea-main-app/qea-main-app.html')
    .pipe(vulcanize({
      stripComments: true,
      inlineCss: true,
      inlineScripts: true,
    }))
    .pipe(gulp.dest('./distribution/qea-main-app/'));
});

gulp.task('copyFiles', () => {
  const destination = ISDISTMODE ? 'distribution' : '.transpiled';
  if (ISDISTMODE) {
    gulp.src('.transpiled/index.html')
      .pipe(htmlreplace({
        app: '<link rel="import" href="./qea-main-app/qea-main-app.html">',
        webcomponents: './bower_components/webcomponentsjs/webcomponents-lite.js',
        polymerRedux: '<link rel="import" href="./bower_components/polymer-redux/polymer-redux.html">',
      }))
      .pipe(gulp.dest(`${destination}`));

    gulp.src('./distribution/qea-main-app/qea-main-app.html')
      .pipe(replace('../../images/', '../images/'))
      .pipe(gulp.dest('./distribution/qea-main-app/'));
    gulp.src(
      ['bower_components/{webcomponentsjs,polymer-redux,polymer}/**/*']
    ).pipe(gulp.dest('./distribution/bower_components/'));
  }
  gulp.src('app/styles/**/*')
    .pipe(gulp.dest(`${destination}/styles/`));
  gulp.src('node_modules/redux/dist/redux.min.js')
    .pipe(gulp.dest(`${destination}/script/`));
  return gulp.src('app/images/**/*')
    .pipe(gulp.dest(`${destination}/images/`));
});
