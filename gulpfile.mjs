import gulp from 'gulp';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
import cleanCSS from 'gulp-clean-css';
import autoprefixer from 'gulp-autoprefixer';
import imagemin from 'gulp-imagemin';
import webp from 'gulp-webp';
import { deleteAsync } from 'del';
import fileInclude from 'gulp-file-include'; // Подключение gulp-file-include
import browserSync from 'browser-sync';

const { src, dest, series, parallel, watch } = gulp;

const sassCompiler = gulpSass(dartSass);

const paths = {
    styles: {
        src: 'app/scss/**/*.scss',
        dest: 'dist/css'
    },
    images: {
        src: 'app/images/**/*.{jpg,png}',
        dest: 'dist/images'
    },
    html: {
        src: 'app/*.html',
        dest: 'dist'
    },
    templates: {
        src: 'app/template/**/*.html', // Путь к шаблонам
        dest: 'dist/template'
    }
};

async function clean() {
    await deleteAsync(['dist']);
}

function processHtml() {
    return src(paths.html.src)
        .pipe(fileInclude({
            prefix: '@',
            basepath: 'app' // Базовая директория для инклюдов
        }))
        .pipe(dest(paths.html.dest))
        .pipe(browserSync.stream());
}

function styles() {
    return src(paths.styles.src)
        .pipe(sassCompiler().on('error', sassCompiler.logError))
        .pipe(autoprefixer({ cascade: false }))
        .pipe(cleanCSS())
        .pipe(dest(paths.styles.dest))
        .pipe(browserSync.stream());
}

function convertToWebp() {
    return src(paths.images.src)
        .pipe(imagemin())
        .pipe(webp())
        .pipe(dest(paths.images.dest));
}

function serve() {
    browserSync.init({
        server: './dist'
    });

    watch(paths.styles.src, styles);
    watch(paths.images.src, convertToWebp);
    watch(paths.html.src, processHtml);
    watch(paths.templates.src, processHtml); // Следить за шаблонами
}

export default series(clean, parallel(styles, convertToWebp, processHtml), serve);

