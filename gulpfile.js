'use strict';

require('dotenv').config({ silent: true });
const mountPath = process.env.MOUNT_PATH || '';

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
const inject = require('gulp-inject');
const historyApiFallback = require('connect-history-api-fallback');
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;

// Utility functions
let ISDISTMODE = false;

gulp.task('default', ['dist'], () => {

});

// clean the bild direcories
gulp.task('clean', () => {
  return del(['.transpiled', 'dist']);
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
gulp.task('serve:lint', ['transpile', 'lint'], () => {
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
  gulp.watch('app/**/*.{html, js}', ['transpile', 'lint', reload]);
});

// tranpile javascript
gulp.task('transpile', ['copyFiles'], () => {
  gulp.src('app/index.html')
    .pipe(gulp.dest('./.transpiled'));

  return gulp.src(['app/**/*.html', '!app/bower_components/**/*', '!app/index.html'])
    .pipe(gulpif(!ISDISTMODE, plumber()))
    .pipe(crisper({
      scriptInHead: false, // true is default
      onlySplit: false,
    }))
    .pipe(gulpif(!ISDISTMODE, sourcemaps.init()))
    .pipe(babel({
      plugins: ['transform-object-assign', 'es6-promise'],
      presets: ['es2015'],
      only: '*.js',
    }))
    .pipe(gulpif(!ISDISTMODE, sourcemaps.write('.')))
    .pipe(gulpif(!ISDISTMODE, plumber.stop()))
    .pipe(gulp.dest('./.transpiled'));
});


// lint using AirBnB's rules
gulp.task('lint', () => {
  const src = ['app/**/*.{html,js}', '!app/test/**/*'];
  if (ISDISTMODE) {
    src.push('gulpfile.js');
  }
  return gulp.src(src)
  .pipe(eslint())
  .pipe(eslint.format())
  .pipe(gulpif(ISDISTMODE, eslint.failAfterError()));
});

gulp.task('dist', () => {
  ISDISTMODE = true;
  runSequence('clean', 'lint', 'transpile', 'injectDinamicImports', 'vulcanize', 'copyFiles');
});

// optimize polymer compomponents
gulp.task('vulcanize', () => {
  return gulp.src('./.transpiled/elements/elements.html')
    .pipe(vulcanize({
      abspath: '',
      stripComments: true,
      inlineCss: true,
      inlineScripts: true,
      addedImports: [
        '../bower_components/import-tinymce/import-tinymce.html',
      ],
    }))
    .pipe(gulp.dest('./dist/elements/'));
});

gulp.task('copyFiles', ['copyAssets'], () => {
  const destination = ISDISTMODE ? 'dist' : '.transpiled';
  if (ISDISTMODE) {
    // change paths
    gulp.src('.transpiled/index.html')
      .pipe(htmlreplace({
        baseurl: `<base href="${mountPath}/">`,
        mountpath: `<qea-main-app id="mainApp" mount-path="${mountPath}"></qea-main-app>`,
        webcomponents: './bower_components/webcomponentsjs/webcomponents-lite.js',
      }))
      .pipe(gulp.dest(`${destination}`));

    // copy necessary bower components
    gulp.src(
      ['bower_components/{webcomponentsjs,import-tinymce,tinymce,ace-element}/**/*']
    ).pipe(gulp.dest('./dist/bower_components/'));
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
  const destination = ISDISTMODE ? 'dist' : '.transpiled';
  if (ISDISTMODE) {
    // change image paths
    gulp.src('./dist/elements/elements.html')
      .pipe(replace('../../images/', '../images/'))
      .pipe(replace(/="[^\s]*\/?assets\//g, '="../assets/'))
      .pipe(replace(/\/\/ <replace:start>[\s\S]*\/\/ <replace:stop>/g,
         'this._renderEditor(qid, editorType, this.query.eid);'))
      .pipe(gulp.dest('./dist/elements/'));

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


gulp.task('injectDinamicImports', () => {
  return gulp.src('.transpiled/elements/elements.html')
    .pipe(inject(gulp.src('.transpiled/elements/asq-*-editor/asq-*-editor.html',
        { read: false }), { relative: true }))
    .pipe(gulp.dest('./.transpiled/elements'));
});


gulp.task('electron', ['transpile'], () => {
  gulp.src('.transpiled/index.html')
    .pipe(htmlreplace({
      mountpath: `<qea-main-app id="mainApp"
                    mount-path="${mountPath}" is-electron></qea-main-app>`,
      electronRequire: `<script> window.nodeRequire = require;
        delete window.require;delete window.exports;
        delete window.module;</script>`,
      baseurl: '',
    }))
    .pipe(gulp.dest('.transpiled'));

  return;
});
