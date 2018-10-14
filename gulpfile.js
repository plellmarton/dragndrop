var gulp = require('gulp')
var sass = require('gulp-sass')
var uglify = require('gulp-uglify')
var sourcemaps = require('gulp-sourcemaps')
var rename = require('gulp-rename')
var browserSync = require('browser-sync').create()

gulp.task('styles', function () {
  return gulp.src('src/sass/main.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({
      outputStyle: 'compressed'
    }).on('error', sass.logError))
    .pipe(rename(function (path) {
      path.basename += '.min'
    }))
    .pipe(sourcemaps.write('maps'))
    .pipe(gulp.dest('dist/css'))
    .pipe(browserSync.stream())
})

gulp.task('scripts', function () {
  return gulp.src('src/js/*.js')
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(rename(function (path) {
      path.basename += '.min'
    }))
    .pipe(sourcemaps.write('maps'))
    .pipe(gulp.dest('dist/js'))
    .pipe(browserSync.stream())
})

// Static server
gulp.task('watch', function () {
  browserSync.init({
    proxy: 'http://dragndrop.local'
  })

  gulp.watch('./src/sass/**/*.scss', gulp.series('styles'))
  gulp.watch('./src/js/**/*.js', gulp.series('scripts'))
})
