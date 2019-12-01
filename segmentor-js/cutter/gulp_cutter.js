var gulp = require('gulp');
var concat = require('gulp-concat');

libname = 'cutter';
files = [
  '_pre', 'calculator', 'cutter', '_post'
];

files = files.map(e => './src/' + e + '.js');

gulp.task('scripts', function() {
  return gulp.src(files)
    .pipe(concat(libname + 'lib.js'))
    .pipe(gulp.dest('./'));
});

