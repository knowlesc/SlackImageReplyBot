var gulp = require('gulp');
var gutil = require('gulp-util');
var spawn = require('child_process').spawn ;
var node;

gulp.task('default', function() {
  if (node) {
    node.kill();
  }
  node = spawn('node', ['main.js'], {stdio: 'inherit'});
});

gulp.watch('bot/**/*.js', ['default'])