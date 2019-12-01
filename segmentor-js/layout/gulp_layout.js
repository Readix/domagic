var gulp = require('gulp');
var concat = require('gulp-concat');
 
files = [
  '_pre', 'meta', 'area', 'element', 'maket', '_post'
];

files = files.map(e => './src/' + e + '.js');

gulp.task('scripts', function() {
  return gulp.src(files)
    .pipe(concat('layoutlib.js'))
    .pipe(gulp.dest('./'));
});

