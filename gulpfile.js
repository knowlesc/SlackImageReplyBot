var gulp = require('gulp');
var watch = require('gulp-watch');
var gutil = require('gulp-util');
var eslint = require('gulp-eslint');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var spawn = require('child_process').spawn;
var node;

gulp.task('default', ['run', 'watch', 'lint', 'js']);

gulp.task('run', function() {
  if (node) {
    node.kill();
  }
  node = spawn('node', ['main.js'], {stdio: 'inherit'});
});

gulp.task('lint', function () {
  gulp.src(['src/client/js/**/*.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('js', function() {
  browserify({
    entries: 'src/client/js/app.js',
    debug: true
  }).bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('./build'));
});

gulp.task('watch', function() {
  gulp.watch(['main.js', 'src/server/**/*.js'], ['run']);
  gulp.watch(['src/client/**/*.js', 'src/client/**/*.html', '!src/client/build/**/*'], ['lint', 'js'])
})
