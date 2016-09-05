var gulp = require('gulp');
var watch = require('gulp-watch');
var gutil = require('gulp-util');
var eslint = require('gulp-eslint');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var less = require('gulp-less');
var spawn = require('child_process').spawn;
var botManager;

gulp.task('default', ['run', 'watch', 'lint', 'js', 'css']);
gulp.task('build', ['js', 'css']);

gulp.task('run', ['bot-manager']);

gulp.task('bot-manager', function() {
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
  gulp.src('src/client/style/style.less')
    .pipe(less())
    .pipe(gulp.dest('build'));

  gulp.src('node_modules/bootstrap/dist/fonts/*.*')
    .pipe(gulp.dest('build/fonts'));

  gulp.src('node_modules/bootstrap/dist/css/*.css')
    .pipe(gulp.dest('build'));

  gulp.src('node_modules/angular-material/angular-material*.css')
    .pipe(gulp.dest('build'));
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
  gulp.watch(['botrunner.js', 'src/botrunner/**/*.js'], ['bot-manager']);
  gulp.watch(['botmanager.js', 'src/botmanager/**/*.js'], ['bot-manager']);
  gulp.watch(['src/client/**/*.js', 'src/client/**/*.html'], ['lint', 'js']);
  gulp.watch(['src/client/style/**/*.less'], ['css']);
})
