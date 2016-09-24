var gulp = require('gulp');
var watch = require('gulp-watch');
var gutil = require('gulp-util');
var eslint = require('gulp-eslint');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var less = require('gulp-less');
var spawn = require('child_process').spawn;
var merge = require('merge-stream');
var del = require('del');
var botManager;

gulp.task('default', ['run', 'watch', 'lint', 'js', 'css']);

gulp.task('build', ['js', 'css']);

gulp.task('clean', function() {
  del(['build']);
})

gulp.task('run', function() {
  if (botManager) {
    botManager.kill();
  }
  botManager = spawn('node', ['botmanager.js'], { stdio: 'inherit' });
});

gulp.task('lint', function () {
  return gulp.src(['src/client/js/**/*.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('css', function () {
  var app = gulp.src('src/client/style/style.less')
    .pipe(less())
    .pipe(gulp.dest('build'));

  var fonts = gulp.src('node_modules/bootstrap/dist/fonts/*.*')
    .pipe(gulp.dest('build/fonts'));

  var styles = gulp.src(['node_modules/bootstrap/dist/css/*.css',
    'node_modules/angular-material/angular-material*.css'])
    .pipe(gulp.dest('build'));

  return merge(app, fonts, styles);
});

gulp.task('js', function() {
  return browserify({
    entries: 'src/client/js/app.js',
    debug: true
  }).bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('./build'));
});

gulp.task('watch', function() {
  gulp.watch(['src/botrunner/**/*.js', 'src/bot/**/*.js'], ['run']);
  gulp.watch(['botmanager.js', 'src/botmanager/**/*.js'], ['run']);
  gulp.watch(['src/client/**/*.js', 'src/client/**/*.html'], ['lint', 'js']);
  gulp.watch(['src/client/style/**/*.less'], ['css']);
})
