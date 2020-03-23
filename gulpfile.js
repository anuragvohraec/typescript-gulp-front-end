"use strict";

const gulp = require('gulp');
const ts = require('gulp-typescript');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const gutil = require('gulp-util');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const imagemin = require('gulp-imagemin');
const tsify = require("tsify");
const babelify = require('babelify');

//for creating directories
const fs = require('fs');

function clean(cb) {
    ['dist', 'lib'].forEach(dirPath=>{
        fs.rmdirSync(dirPath, {recursive: true});
    })
    cb();
}

//src for source code, 
//lib is for compilation out put of typescript file, 
//dist is for prod use
const project_structure = [
    'src',
    'src/assets/fonts',
    'src/assets/img',
    'dist',
    'lib'
]

//TASK: creates project skeleton if its not created before hand
function create_project_skeleton(cb){
    project_structure.forEach(dirPath=>{
        if(!fs.existsSync(dirPath)){
            fs.mkdirSync(dirPath);
            console.log('📁  folder created:', dirPath);
        }
    });
    cb();
}


const htmlPaths=["src/**/*.html", "src/**/*.css", "src/**/*.ttf"];
//TASK: copy all html, css, fonts files 
function copy_html(cb){
    gulp.src(htmlPaths)
    .pipe(gulp.dest('dist'));

    cb();
}

//TASK: minifies images
function minify_image(cb){
    gulp.src('src/assets/img/**/*')
    .pipe(imagemin())
    .pipe(gulp.dest('dist/assets/img'));

    cb();
}

function compile_ts_file(cb){
    const tsconfig = require('./src/tsconfig.json');
    const filesGlob = [
        "src/**/*.ts",
        "!./node_modules/**/*.ts"
    ];
    gulp.src(filesGlob)
      .pipe(ts(tsconfig.compilerOptions))
      .pipe(gulp.dest('./lib'));

    cb();
}

function do_browserify(cb){
    const b = browserify({
        entries: './lib/index.js',
        debug: false,
      }).transform(babelify.configure({
        presets : ["es2015"]
    }));
    b.bundle()
        .pipe(source('bundle.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
            // Add transformation tasks to the pipeline here.
            //.pipe(uglify())
            .on('error', gutil.log)
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./dist/'));

        cb();
}

function build(cb) {
    gulp.series(create_project_skeleton, clean,
        copy_html, minify_image, compile_ts_file,
        do_browserify
        )();

    cb();
}

exports.create_project_skeleton = create_project_skeleton;
exports.copy_html = copy_html;
exports.minify_image = minify_image;
exports.compile_ts_file = compile_ts_file;
exports.do_browserify= do_browserify;
exports.clean = clean;

exports.default = build;