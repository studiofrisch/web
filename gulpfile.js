// get gulp and modules
var gulp = require('gulp'),
	sync = require('browser-sync'),
	moment = require('moment'),
	sass = require('gulp-sass'),
	bourbon = require('node-bourbon'),
	neat = require('node-neat'),
	autoprefix = require('gulp-autoprefixer'),
	uglify = require('gulp-uglify'),
	rename = require('gulp-rename'),
	imagemin = require('gulp-imagemin'),
	plumber = require('gulp-plumber'),
	concat = require('gulp-concat'),
	htmlhint = require('gulp-htmlhint'),
	jade = require('gulp-jade'),
	del = require('del'),
	sitemap = require('gulp-sitemap');


// link public assets
var base = "www";

// clean
gulp.task('clean', function () {
    return del([
        'www/**/*',
    ]);
});

// minify images
gulp.task('imagemin', function () {
	return gulp.src(['img/*', 'img/**/*'])
		.pipe(plumber())
		.pipe(imagemin({progressive: true}))
		.pipe(gulp.dest(base + '/img'));
});

// svg
gulp.task('svg', function () {
	return gulp.src(['svg/*', 'svg/**/*'])
		.pipe(plumber())
		.pipe(gulp.dest(base + '/svg'));
});

// compile sass to css and prefix
gulp.task('sass', function () {
	gulp.src('./sass/*.scss')
		.pipe(plumber())
		.pipe(sass({
			includePaths: neat.includePaths
		}))
		.pipe(autoprefix('last 10 version'))
		.pipe(gulp.dest(base + '/css'))
		.pipe(sync.stream());
});

// compiles jade
gulp.task('jade', function () {
	return gulp.src('./jade/*.jade')
		.pipe(plumber())
		.pipe(jade({
			pretty: true
		}))
		.pipe(rename(function(path) {
			if (path.basename == 'index') return;
			path.dirname = path.basename;
			path.basename = "index";
		}))
		.pipe(gulp.dest(base));

});

// sitemap
gulp.task('sitemap', function () {
	gulp.src(base + '/**/*.html')
		.pipe(sitemap({
			siteUrl: 'http://extremeautomation.io'
		}))
		.pipe(gulp.dest(base));
});

// validate
gulp.task('validate', function () {
	gulp.src("./www/*.html")
		.pipe(htmlhint({
			"src-not-empty": true
		}))
		.pipe(htmlhint.reporter('fail'));
});

// contact js and minify
gulp.task('uglify', function () {
	gulp.src([
			'js/vendor/jquery.min.js', 
			'js/vendor/scrollmagic.js', 
			'js/vendor/*.js', 
			'js/*.js'
		])
		.pipe(plumber())
		.pipe(concat('main.js'))
		.pipe(uglify())
		.pipe(gulp.dest(base + '/js'));
});

// copy other resources
gulp.task('copy', function () {
	gulp.src(['fonts/**'])
		.pipe(gulp.dest(base + '/fonts'));
});

// watch tasks (to relaod browser after finish)
gulp.task('html-watch', ['jade'], sync.reload);
gulp.task('js-watch', ['uglify'], sync.reload);
gulp.task('img-watch', ['imagemin'], sync.reload);
gulp.task('svg-watch', ['svg'], sync.reload);

// watch
gulp.task('watch', function () {
	sync.init({
		server: base,
		port: 8080,
		notify: false
	});
	gulp.watch(['js/*.js', 'js/**/*.js'], ['js-watch']);
	gulp.watch(['img/*', 'img/**/*'], ['img-watch']);
	gulp.watch(['svg/*', 'svg/**/*'], ['svg-watch']);
	gulp.watch(['sass/*.scss', 'sass/**/*.scss'], ['sass']);
	gulp.watch(['jade/*.jade', 'jade/**/*.jade'], ['html-watch', 'sitemap']);
	gulp.watch(['favicon.ico', 'humans.txt', 'robots.txt'], ['copy']);
});

// main work
gulp.task('build', function () {
	gulp.start('sass', 'jade', 'uglify', 'imagemin', 'svg', 'copy', 'sitemap');
}); 

gulp.task('default', ['build', 'watch']);