'use strict';

// Include Gulp & tools we'll use
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');

var reload = browserSync.reload;
var nodemon = require('gulp-nodemon');
var bourbon = require('node-bourbon');
var replace = require('gulp-replace');
var bower = require('gulp-bower');

var AUTOPREFIXER_BROWSERS = [
  'ie >= 10',
  'ie_mob >= 10',
  'ff >= 30',
  'chrome >= 34',
  'safari >= 7',
  'opera >= 23',
  'ios >= 7',
  'android >= 4.4',
  'bb >= 10'
];

// Lint JavaScript
gulp.task('jshint', function() {
return gulp.src(['public/js/**/*.js','blog/content/themes/uno-e/assets/js/**/*.js'])
    .pipe(reload({
      stream: true,
      once: true
    }))
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.if(!browserSync.active, $.jshint.reporter('fail')))
    .pipe(gulp.dest('public/js'));
});

// Optimize images
gulp.task('images', function() {
  return gulp.src('public/images/**/*')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('public/images'))
    .pipe($.size({
      title: 'images'
    }));
});



// Compile and automatically prefix stylesheets
gulp.task('styles', function(cb) {
  runSequence(['site styles', 'blog theme styles'],'propagate blog theme','copy blog theme', cb);
});
gulp.task('site styles', function() {
  // For best performance, don't add Sass partials to `gulp.src`
  del(['.tmp'], function (err, deletedFiles) {
      console.log('Files deleted:', deletedFiles.join(', '));
  });
  return gulp.src([
      'public/scss/*.scss'
    ])
    .pipe($.sourcemaps.init())
    .pipe($.changed('.tmp/styles', {
      extension: '.css'
    }))
    .pipe($.sass({
      precision: 10,
      onError: console.error.bind(console, 'Sass error:')
    }))
    .pipe($.autoprefixer({
      browsers: AUTOPREFIXER_BROWSERS
    }))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('.tmp/styles'))
    // Concatenate and minify styles
    .pipe($.if('*.css', $.csso()))
    .pipe(gulp.dest('public/css'))
    .pipe($.size({
      title: 'site styles'
    }));
});
gulp.task('copy blog theme', function() {
  return gulp.src([ 'blog/content/themes/uno-e/assets/css/**/*.css'])
  .pipe(replace('../','../../'))
    .pipe(gulp.dest('public/css/theme'));
});
gulp.task('propagate blog theme', function() {
  return gulp.src([ 'blog/content/themes/uno-e/**/*'])
  .pipe(replace('/blog/#blog','/#blog'))
    .pipe(gulp.dest('../ghost/content/themes/uno-e'));
});

gulp.task('blog theme styles', function() {
  // For best performance, don't add Sass partials to `gulp.src`
  del(['.tmp'], function (err, deletedFiles) {
      console.log('Files deleted:', deletedFiles.join(', '));
  });
  return gulp.src([
      'blog/content/themes/uno-e/assets/scss/uno-e.scss'
    ])
    .pipe($.sourcemaps.init())
    .pipe($.changed('.tmp/styles', {
      extension: '.css'
    }))
    .pipe($.sass({
      precision: 10,
      includePaths: bourbon.includePaths,
      onError: console.error.bind(console, 'Sass error:')
    }))
    .pipe($.autoprefixer({
      browsers: AUTOPREFIXER_BROWSERS
    }))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('.tmp/styles'))
    // Concatenate and minify styles
    .pipe($.if('*.css', $.csso()))
    .pipe(gulp.dest('blog/content/themes/uno-e/assets/css'))
    .pipe($.size({
      title: 'blog theme styles'
    }));
});

//
// Clean output directory
//gulp.task('clean', del.bind(null, ['.tmp', 'public/*', '!public/.git'], {
//   dot: true
// }));

// Watch files for changes & reload
//run app using nodemon
gulp.task('runapp', function() {
  return nodemon({
    script: 'app.js',
    watch: ['app.js']
  })
  .on('restart', function onRestart() {

       // Also reload the browsers after a slight delay
       setTimeout(function reload() {
         reload();
       }, 3000);
  });
});

gulp.task('serve', ['styles','jshint','images','bower','runapp'], function() {

  browserSync({
    notify: true,
    // Customize the BrowserSync console logging prefix
    logPrefix: 'browsersync',
    proxy: "localhost:3000",
    port: 3001,
    open: "local"
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    //server: ['.tmp', 'app']
  });

  gulp.watch(['views/**/*.hbs'],[reload]);
  gulp.watch(['public/scss/**/*.scss','blog/content/themes/uno-e/assets/scss/**/*.scss'], ['styles', reload]);
  gulp.watch(['public/js/**/*.js'], ['jshint',reload]);
  gulp.watch(['public/images/**/*'], ['images', reload]);

});

gulp.task('bower', function() {
  return bower()
    .pipe(gulp.dest('public/components'))
});

// Build production files, the default task
gulp.task('default', function(cb) {
  runSequence('styles', ['jshint', 'images','bower'], cb);
});
