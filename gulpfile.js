/**
 * Created by Richard on
 * @author Richard
 * @date 2016/04/25
 */

var gulp = require('gulp');
var del = require('del');
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;
var gulpLoadPlugins  = require('gulp-load-plugins');
var plugins = gulpLoadPlugins();
var changed = plugins.changed;
var Server = require('karma').Server;

/**
 * 初始化任务
 * @param prefix 任务名称前缀
 * @param src 文件目录
 * @param dest 目标目录
 */
function initTask(prefix,src,dest){
    var tasks = {
        js: 'js',
        res:'res',
        sass:'sass',
        copy:'copy',
        html:'html',
        clean:'clean',
        serve:'serve'
    };

    var globals = {
        js:{
            src:[src + '/**/*.js','!' + src +  '/**/*.min.js'],
            dest:dest
        },
        res:{
            src:[src + '/css/**/*'],
            dest:'dist'
        },
        sass:{
            src:src + '/scss/**/*.scss',
            dest:dest + '/scss'
        },
        copy:{
            src:[src + '/**/*.*','!'+ src +'/**/*.js','!'+ src + '/**/*.scss','!'+ src + '/**/*.html'],
            dest:dest
        },
        html:{
            src: src + '/**/*.html',
            dest:dest
        }
    };

    if(prefix) {
        for (var n in tasks) {
            tasks[n] = prefix + '-' + tasks[n];
        }
    }

    //scss
    gulp.task(tasks.sass,function (){
        gulp.src(globals.sass.src)
            //.pipe(plugins.sourcemaps.init())
            .pipe(plugins.sass().on('error', plugins.sass.logError))
            //.pipe(plugins.cleanCss())
            //.pipe(plugins.sourcemaps.write('.'))
            .pipe(gulp.dest(globals.sass.dest))
            .pipe(reload({stream: true}));
    });

    //clean dest directory
    gulp.task(tasks.clean,function(){
        del(dest + '/*');
    });

    //copy resource
    gulp.task(tasks.copy,function (){
        gulp.src(globals.copy.src)
            .pipe(gulp.dest(dest));
    });

    //js
    gulp.task(tasks.js,function (){
        return gulp.src(globals.js.src)
            //.pipe(plugins.sourcemaps.init())
            //.pipe(plugins.uglify())
            //.pipe(plugins.sourcemaps.write('.'))
            .pipe(gulp.dest(globals.js.dest))
            .pipe(reload({stream:true}));
    });

    //html
    gulp.task(tasks.html,function (){
        return gulp.src(globals.html.src)
            .pipe(plugins.htmlmin())
            .pipe(gulp.dest(globals.html.dest));
    });

    //serve
    gulp.task(tasks.serve,[tasks.clean,tasks.copy,tasks.html,tasks.sass,tasks.js],function (){
        browserSync.init({
            server:{
                baseDir:dest
            },
            open: false,
            port: 3000
        });

        gulp.watch(globals.html.src,[tasks.html]).on('change',reload);
        gulp.watch(globals.sass.src,[tasks.sass]);
        gulp.watch(globals.js.src,[tasks.js]);
        gulp.watch(globals.res.src,function (){
            gulp.src(globals.res.src)
                .pipe(changed(globals.res.dest))
                .pipe(globals.res.dest);
        }).on('change',reload);
    });

    //default
    gulp.task(prefix || 'default',[ tasks.serve]);

    //unit test
    gulp.task('test',function (done){
        new Server({
            configFile:__dirname + '/karma.conf.js',
            singleRun:true
        },done).start();
    });
    gulp.task('tdd',function (done) {
        new Server({
            configFile:__dirname + '/karma.config.js',
        },done).start();
    });
}

initTask('','src','dist');