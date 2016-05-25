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
const sourcemaps = require('gulp-sourcemaps');
const rename = require('gulp-rename');
const historyApiFallback = require('connect-history-api-fallback');
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;

// Utility functions
let ISDISTMODE = false;

gulp.task('default', ['dist'], () => {

});

// clean the bild direcories
gulp.task('clean', () => {
  return del(['.transpiled', 'distribution']);
});

// create a web server with live reload
gulp.task('serve', ['transpile'], () => {
  browserSync.init({
    server: {
      baseDir: '.transpiled',
      routes: {
        '/bower_components': 'bower_components',
      },
      middleware: [historyApiFallback()],
    },
    notify: false,
  });
  gulp.watch('app/**/*.{html, js}', ['transpile', reload]);
});

// create a web server with live reload and linting
gulp.task('serve:linter', ['transpile', 'linter'], () => {
  browserSync.init({
    server: {
      baseDir: '.transpiled',
      routes: {
        '/bower_components': 'bower_components',
      },
      middleware: [historyApiFallback()],
    },
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
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['es2015'],
      only: '*.js',
    }))
    .pipe(sourcemaps.write('.'))
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
  return gulp.src('./.transpiled/elements/elements.html')
    .pipe(vulcanize({
      abspath: '',
      stripComments: true,
      inlineCss: true,
      inlineScripts: true,
      addedImports: ['./bower_components/import-tinymce/import-tinymce.html'],
    }))
    .pipe(gulp.dest('./distribution/'));
});

gulp.task('copyFiles', ['copyAssets'], () => {
  const destination = ISDISTMODE ? 'distribution' : '.transpiled';
  if (ISDISTMODE) {
    // change paths
    gulp.src('.transpiled/index.html')
      .pipe(htmlreplace({
        app: '<link rel="import" href="./elements.html">',
        webcomponents: './bower_components/webcomponentsjs/webcomponents-lite.js',
      }))
      .pipe(gulp.dest(`${destination}`));

    // copy necessary bower components
    gulp.src(
      ['bower_components/{webcomponentsjs,import-tinymce,tinymce}/**/*']
    ).pipe(gulp.dest('./distribution/bower_components/'));
  }
  // copy styles
  gulp.src('app/styles/**/*')
    .pipe(gulp.dest(`${destination}/styles/`));
  // copy script
  gulp.src('node_modules/redux/dist/redux.min.js')
    .pipe(gulp.dest(`${destination}/script/`));
  // copy images
  return gulp.src('app/images/**/*')
    .pipe(gulp.dest(`${destination}/images/`));
});


gulp.task('copyAssets', () => {
  const destination = ISDISTMODE ? 'distribution' : '.transpiled';
  if (ISDISTMODE) {
    // change image paths
    gulp.src('./distribution/qea-main-app/qea-main-app.html')
      .pipe(replace('../../images/', '../images/'))
      .pipe(replace(/="[^\s]*assets\//, '="./assets/'))
      .pipe(gulp.dest('./distribution/qea-main-app/'));

    gulp.src('app/elements/**/assets/**/*')
      .pipe(rename((path) => {
        path.dirname = path.dirname.match(/\/assets.*/)[0] || 'assets';
      }))
      .pipe(gulp.dest(`${destination}/`));
  } else {
    gulp.src('app/elements/**/assets/**/*')
      .pipe(gulp.dest(`${destination}/elements/`));
  }
  // copy images
  return gulp.src('app/images/**/*')
    .pipe(gulp.dest(`${destination}/images/`));
});
