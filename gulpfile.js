require('es6-promise').polyfill();
var gulp = require('gulp'),
    connect = require('gulp-connect'),
    watch = require('gulp-watch'),
    livereload = require('gulp-livereload'),
    gulpSequence = require('gulp-sequence'),
    series = require('stream-series'),
		webserver = require('gulp-webserver');


/********     LIVERELOAD & SERVER   *******/
gulp.task('webserver', function() {
	gulp.src('dist')
		.pipe(webserver({
			livereload: true,
			directoryListing: {
				enable:true,
				path: 'dist'
			},
			open: 'http://localhost:3000/index.html',
			port: 3000
		}));
});

/********     WATCH FILES     *******/
gulp.task('watch', function() {
    gulp.watch('./src/assets/css/**/*.css', ['rebuild-develop']);
    gulp.watch('./src/assets/scripts/**/*.js', ['rebuild-develop']);
    gulp.watch('./src/views/**/*.*', ['rebuild-develop']);
});


/********     CSS      *******/
gulp.task('css', function() {
	return gulp.src('./src/assets/css/**/*.*')
		.pipe(gulp.dest('./dist/assets/css/'));
});


/********     JS        *******/
gulp.task('script', function() {
	return series(gulp.src('./src/assets/scripts/**/*.js'))
		.pipe(gulp.dest('./dist/assets/scripts/'));
});

/********     HTML        *******/
gulp.task('html', function() {
	return gulp.src('./src/views/*.html')
		.pipe(gulp.dest('./dist/'));
});


/********     DEFAULT SEQUENCE     *******/
gulp.task('sequence-develop', function (cb) {
    gulpSequence('css', 'script', 'html', 'watch', 'webserver',  cb);
});

gulp.task('rebuild-develop', function (cb) {
	gulpSequence('css', 'script', 'html',  cb);
});

gulp.task('default', ['sequence-develop']);