var gulp = require('gulp');
var concat = require('gulp-concat');

files = [
  '_pre', 'meta', 'content', 'contentStorage', '_post'
];

files = files.map(e => './src/' + e + '.js');

gulp.task('scripts', function() {
  return gulp.src(files)
    .pipe(concat('contentlib.js'))
    .pipe(gulp.dest('./'));
});

