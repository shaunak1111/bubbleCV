var gulp = require('gulp');
var connect = require('gulp-connect');
var uglify = require('gulp-uglify');
var babel = require('gulp-babel');
var paths = {
  src: 'app/**/*',
  srcHTML: 'app/*.html',
  srcCSS: 'app/**/*.css',
  srcJS: 'app/js/*.js',
  srcLib: 'app/lib/*.js',
  srcImg : 'app/img/*',
  tmp: 'tmp',
  tmpIndex: 'tmp/index.html',
  tmpCSS: 'tmp/**/*.css',
  tmpJS: 'tmp/js/*.js',
  tmpLib: 'tmp/lib/*.js',
  tmpImg: 'tmp/img/*',
  dist: 'dist',
  distIndex: 'dist/index.html',
  distCSS: 'dist/*.css',
  distJS: 'dist/*.js',
  distLib: 'dist/lib/*.js'
};

var inject = require('gulp-inject');

var webserver = require('gulp-webserver');

var htmlclean = require('gulp-htmlclean');
var cleanCSS = require('gulp-clean-css');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

// var browserSync = require('browser-sync').create();

// gulp.task('serve',()=>{

// });

gulp.task('webserver', function() {
  connect.server({
  	livereload: true
  });
});

// gulp.task('html', function () {
//   return gulp.src(paths.srcHTML).pipe(gulp.dest(paths.tmp));
// });

// gulp.task('css', function () {
//   return gulp.src(paths.srcCSS).pipe(gulp.dest(paths.tmp));
// });

// gulp.task('lib', function() {
// 	return gulp.src(paths.srcLib).pipe(gulp.dest(paths.tmp + '/lib'));
// });

// gulp.task('js', function () {
//   return gulp.src(paths.srcJS).pipe(gulp.dest(paths.tmp + '/js'));
// });

// gulp.task('img', function () {
//   return gulp.src(paths.srcImg).pipe(gulp.dest(paths.tmp + '/img'));
// });

// gulp.task('copy', ['html', 'css', 'lib','js','img']);

// gulp.task('minify', function() {
//   gulp.src('app/js/bubble-copy.js')
//   .pipe(babel({
//     presets: ['env']
//    }))
//   .pipe(uglify())
//   .pipe(gulp.dest('./dist'));
// });

// gulp.task('inject', ['copy'], function () {
//   var css = gulp.src(paths.tmpCSS);
//   var js = gulp.src(paths.tmpJS);
//   return gulp.src(paths.tmpIndex)
//     .pipe(inject( css, { relative:true } ))
//     .pipe(inject( js, { relative:true } ))
//     .pipe(gulp.dest(paths.tmp));
// });

gulp.task('html:dist', function () {
  return gulp.src(paths.srcHTML)
    .pipe(htmlclean())
    .pipe(gulp.dest(paths.dist));
});

gulp.task('css:dist', function () {
  return gulp.src(paths.srcCSS)
    .pipe(concat('style.min.css'))
    .pipe(cleanCSS())
    .pipe(gulp.dest(paths.dist));
});



gulp.task('js:dist', function () {
  return gulp.src(paths.srcJS)
  	.pipe(concat('script.min.js'))
    .pipe(babel({
    	presets: ['env']
   	}))
    .pipe(uglify())
    .pipe(gulp.dest(paths.dist));
});

gulp.task('img:dist', function () {
  return gulp.src(paths.srcImg).pipe(gulp.dest(paths.dist + '/img'));
});

gulp.task('copy:dist', ['html:dist', 'css:dist', 'js:dist', 'img:dist']);

gulp.task('inject:dist', ['copy:dist'], function () {
  var css = gulp.src(paths.distCSS);
  var js = gulp.src(paths.distJS);
  return gulp.src(paths.distIndex)
    .pipe(inject( css, { relative:true } ))
    .pipe(inject( js, { relative:true } ))
    .pipe(gulp.dest(paths.dist));
});

// build in to production mode
gulp.task('build', ['inject:dist']);

gulp.task('serve', ['inject'], function () {
  return gulp.src(paths.src)
    .pipe(webserver({
      port: 3000,
      livereload: true
    }));
});


gulp.task('watch', ['serve'], function () {
  gulp.watch(paths.src, ['inject']);
});




// gulp.task('watch',['browserSync'],()=>{
// 	gulp.watch('app/*.html', browserSync.reload);
// 	gulp.watch('app/js/**/*.js', browserSync.reload);
// });

gulp.task('hello', ['webserver']);