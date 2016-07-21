const pump = require('pump');
const gulp = require('gulp');
const shell = require('gulp-shell');
const jshint = require('gulp-jshint');
const stylish = require('jshint-stylish');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const del = require('del');
const map = require('map-stream');
const header = require('gulp-header');
const pkg = require('./package.json');

var banner = [
  '/**',
  ' * ${pkg.name} - ${pkg.description}',
  ' * @version ${pkg.version}',
  ' * @link ${pkg.homepage}',
  ' * @copyright ${pkg.com_tvdavies.copyright}',
  ' * @license ${pkg.com_tvdavies.licenseUrl}',
  ' */',
  ''
].join('\n');

gulp.task('lint', cb => {
  pump([
        gulp.src('src/**/*.js'),
        jshint(),
        jshint.reporter(stylish),
        jshint.reporter('fail')
    ],
    cb
  );
});

gulp.task('build', ['clean', 'lint'], cb => {
  pump([
        gulp.src('src/**/*.js'),
        babel({
          presets: ['es2015'],
          plugins: ['transform-es2015-modules-umd']
        }),
        concat('gridjs.js'),
        header(banner, { pkg: pkg }),
        sourcemaps.write('.'),
        gulp.dest('dist')
    ],
    cb
  );
});

gulp.task('uglify', ['build'], cb => {
  pump([
        gulp.src('dist/*.js'),
        sourcemaps.init(),
        uglify({
          outSourceMap: true
        }),
        header(banner, { pkg: pkg }),
        rename({ extname: '.min.js' }),
        sourcemaps.write('.'),
        gulp.dest('dist')
    ],
    cb
  );
});

gulp.task('clean', () => del(['dist']));
gulp.task('default', ['uglify']);

gulp.task('pre-commit', ['default'], shell.task([
  'git add -f dist/*'
]));