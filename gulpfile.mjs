import gulp from 'gulp';
import gulpSass from 'gulp-sass';
import cleanCSS from 'gulp-clean-css';
import autoprefixer from 'gulp-autoprefixer';
import imagemin from 'gulp-imagemin';
import { deleteAsync } from 'del';
import browserSync from 'browser-sync';
import dartSass from 'sass';
import webp from 'gulp-webp';

const { src, dest, series, parallel, watch } = gulp;
const sass = gulpSass(dartSass);

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
  }
};

async function clean() {
  await deleteAsync(['dist']);
}

function styles() {
  return src(paths.styles.src)
    .pipe(sass().on('error', sass.logError))
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

function html() {
  return src(paths.html.src)
    .pipe(dest(paths.html.dest))
    .pipe(browserSync.stream());
}

function serve() {
  browserSync.init({
    server: './dist'
  });

  watch(paths.styles.src, styles);
  watch(paths.images.src, convertToWebp);
  watch(paths.html.src, html).on('change', browserSync.reload);
}

export default series(clean, parallel(styles, convertToWebp, html), serve);
