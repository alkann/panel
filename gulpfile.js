require('es6-promise').polyfill();
var gulp = require('gulp'),
    del = require('del'),
    connect = require('gulp-connect'),
    watch = require('gulp-watch'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    rename = require('gulp-rename'),
    livereload = require('gulp-livereload'),
    gulpSequence = require('gulp-sequence'),
    uglyfy = require('gulp-uglify'),
    concat = require('gulp-concat'),
    series = require('stream-series'),
    htmlmin = require('gulp-htmlmin'),
    inject = require('gulp-inject'),
    compass = require('gulp-compass'),
    path = require('path'),
    cssmin = require('gulp-cssmin'),
    extender = require('gulp-html-extend'),
    swallowError = function (error) {
        console.log(error.toString());
        this.emit('end');
    };


/********     LIVERELOAD      *******/
gulp.task('webserver', function() {
    connect.server({
        port:8081,
        livereload: true,
        root: ['./']
    });
});

gulp.task('livereload', ['build-scripts'], function() {
    gulp.src(['web/**/*.*']).pipe(watch(['web/**/*.*'])).pipe(connect.reload());
});


/********     WATCH FILES     *******/
gulp.task('watch', function() {
    gulp.watch('./src/assets/scss/**/*.scss', ['build-sass']);
    gulp.watch('./src/assets/scripts/**/*.js', ['build-scripts']);
    gulp.watch('./src/assets/fonts/**/*.*', ['build-fonts']);
    gulp.watch('./src/assets/img/**/*.*', ['build-img']);
    gulp.watch('./src/assets/documents/**/*.*', ['build-docs']);
    gulp.watch('./src/views/**/*.*', ['build-html']);
});


/********     SASS      *******/
/*   Sass sequence - develop  */
gulp.task('build-sass', function (cb) {
    gulpSequence('del-css', 'sass', cb);
});

gulp.task('del-css',  del.bind(null, './web/css/*.css'));

gulp.task('sass', function () {
    gulp.src([
        './src/assets/scss/**/*.scss'
    ])
    .pipe(compass({
        project: path.join(__dirname),
        css: 'src/assets/css',
        sass: 'src/assets/scss',
        sourcemap: true
    }))
    .on('error', swallowError)
    .pipe(gulp.dest('./web/css/'))
});

/*  Sass sequence - production  */
gulp.task('build-sass-prod', function (cb) {
    gulpSequence('del-css', 'sass-prod', cb);
});


gulp.task('sass-prod', function () {
    gulp.src([
        './src/assets/scss/**/*.scss'
    ])
    .pipe(compass({
        project: path.join(__dirname),
        css: 'src/assets/css',
        sass: 'src/assets/scss',
        style: 'compressed',
        output_style :'compressed',
        comments: false,
        logging: false,
        debug_info: false,
        debug: false,
        environment: 'production'
    }))
    .on('error', swallowError)
    .pipe(concat('app.css'))
    .pipe(cssmin())
    .pipe(gulp.dest('./web/css/'))
});

/********     JS        *******/
/*    JS sequence - develop   */
gulp.task('build-scripts', function (cb) {
    gulpSequence('del-scripts', 'script-main',  cb);
});

gulp.task('del-scripts',  del.bind(null, './web/scripts/'));

gulp.task('script-main', function() {
    return series(gulp.src('./src/assets/scripts/**/*.js'))
        .pipe(gulp.dest('./web/scripts/'));
});

/*    JS sequence - production   */
gulp.task('build-scripts-prod', function (cb) {
    gulpSequence('del-scripts', 'script-prod',  cb);
});

gulp.task('script-prod', function() {
    return series(gulp.src('./src/assets/scripts/**/*.js'))
        .pipe(concat('app.min.js'))
        .pipe(uglyfy())
        .pipe(gulp.dest('./web/scripts/'));
});


/********     FONTS     *******/
gulp.task('build-fonts', function(cb) {
    gulpSequence('del-fonts', 'fonts',  cb);
});

gulp.task('del-fonts',  del.bind(null, './web/fonts/'));

gulp.task('fonts', function() {
    return gulp.src('./src/assets/fonts/**/*.*')
        .pipe(gulp.dest('./web/fonts/'));
});


/********     IMG     *******/
gulp.task('build-img', function(cb) {
    gulpSequence('del-img', 'img',  cb);
});

gulp.task('del-img',  del.bind(null, './web/img/'));

gulp.task('img', function() {
    return gulp.src('./src/assets/img/**/*.*')
        .pipe(gulp.dest('./web/img/'));
});

/********     DOCS     *******/
gulp.task('build-docs', function(cb) {
    gulpSequence('del-docs', 'docs',  cb);
});

gulp.task('del-docs',  del.bind(null, './web/documents/'));

gulp.task('docs', function() {
    return gulp.src('./src/assets/documents/**/*.*')
        .pipe(gulp.dest('./web/documents/'));
});


gulp.task('build-html', function(cb) {
    gulpSequence('del-html', 'html', 'inject', cb);
});

gulp.task('del-html',  del.bind(null, './web/*.html'));

gulp.task('html', function() {
    return gulp.src('./src/views/*.html')
        .pipe(extender({annotations:true,verbose:false}))
        .pipe(gulp.dest('./web/'))
});

gulp.task('inject', function() {
    setTimeout(
        function(){
            var sources = gulp.src(['web/scripts/**/*.js', 'web/css/**/*.css'], {read: false});
            return gulp.src('./web/**/*.html')
                .pipe(inject(sources, {relative: true}))
                .pipe(htmlmin({collapseWhitespace: true, removeComments:true}))
                .pipe(gulp.dest('./web/'))
        }
        ,1000
    );
});

/********     DEVELOP SEQUENCE     *******/
gulp.task('sequence-develop', function (cb) {
    gulpSequence('build-fonts', 'build-img', 'build-docs', 'build-html', 'inject', 'build-sass', 'webserver','livereload', 'watch' ,  cb);
});

gulp.task('default', ['sequence-develop']);


/********    PRODUCTION SEQUENCE   *******/
gulp.task('production', function (cb) {
    gulpSequence('build-sass-prod', 'build-fonts', 'build-img', 'build-docs', 'build-scripts-prod', 'build-html',  cb)
});