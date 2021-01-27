const paths = require('./package.json').paths

const gulp = require('gulp')
const watch = require('gulp-watch')

const ttf2eot = require('gulp-ttf2eot')
const ttf2woff = require('gulp-ttf2woff')
const ttf2woff2 = require('gulp-ttf2woff2')

const fs = require('fs')
const rimraf = require('rimraf')

const svgSprite = require('gulp-svg-sprite')

// font woff
const woff = () => {
  return gulp.src( paths.src + '/fonts/*.ttf')
      .pipe(ttf2woff())
      .pipe(gulp.dest( paths.src + '/fonts/'))
}

// font woff2
const woff2 = () => {
  return gulp.src( paths.src + '/fonts/*.ttf')
      .pipe(ttf2woff2())
      .pipe(gulp.dest( paths.src + '/fonts/'))
}

// font eot
const eot = () => {
  return gulp.src( paths.src + '/fonts/*.ttf')
      .pipe(ttf2eot())
      .pipe(gulp.dest( paths.src + '/fonts/'))
}

// styles for fonts
const styles = () => {
  fs.truncate( paths.src + '/scss/_fonts.scss', 0, function () {
    let file_content = fs.readFileSync( paths.src + '/scss/_fonts.scss');

    if (file_content == '') {
      fs.writeFile( paths.src + '/scss/_fonts.scss', '', cb);
      return fs.readdir( paths.src + '/fonts', function (err, items) {
        if (items) {
          let c_fontname;
          for (var i = 0; i < items.length; i++) {
            let fontname = items[i].split('.');

            let style = 'normal',
              weight = '400',
              name = fontname[0].split('-')[0];
            
            if (fontname[0].includes('Black') || fontname[0].includes('black')) {
              weight = '900';
            } else if (fontname[0].includes('ExtraBold') || fontname[0].includes('extrabold')) {
              weight = '800';
            } else if (fontname[0].includes('SemiBold') || fontname[0].includes('semibold')) {
              weight = '600';
            } else if (fontname[0].includes('Bold') || fontname[0].includes('bold')) {
              weight = '700';
            } else if (fontname[0].includes('Medium') || fontname[0].includes('medium')) {
              weight = '500';
            } else if (fontname[0].includes('-Italic') || fontname[0].includes('-italic') || fontname[0].includes('Regular') || fontname[0].includes('regular')) {
              weight = '400';
            } else if (fontname[0].includes('ExtraLight') || fontname[0].includes('extralight')) {
              weight = '200';
            } else if (fontname[0].includes('Light') || fontname[0].includes('light')) {
              weight = '300';
            } else if (fontname[0].includes('Thin') || fontname[0].includes('thin')) {
              weight = '100';
            }

            if (fontname[0].includes('Italic') || fontname[0].includes('italic')) {
              style = 'italic';
            }
            
            

            fontname = fontname[0];
            if (c_fontname != fontname) {
              fs.appendFile( paths.src + '/scss/_fonts.scss', '@include font("' + name + '", "' + fontname + '", "' + weight + '", "' + style + '");\r\n', cb);
            }
            c_fontname = fontname;
          }
        }
      })
    }
  });
}

function cb() {}

const fonts = gulp.series(
  gulp.parallel(
    woff,
    woff2,
    eot
  ),
  styles
)

// svgSprite
const sprite = () => {
  return gulp.src(paths.src + '/sprite/**/*.svg')
    .pipe(svgSprite({
      mode: {
        symbol: {
          sprite: '../sprite.svg'
        }
      },
      svg: {
        namespaceClassnames: false
      }
    }))
    .pipe(gulp.dest(paths.src + '/img/'))
}

const clean_sprite = cb => {
  rimraf( paths.src + '/img/sprite.svg', cb )
}

const _sprite = gulp.series(
  clean_sprite,
  sprite
)

// watch
const _watch = () => {
  watch( 
    paths.src + '/fonts/*.ttf', 
    fonts
  )
  watch( 
    paths.src + '/sprite/**/*.svg', 
    _sprite
  )
}

// exports
module.exports.converter = fonts
module.exports.svg = _sprite
module.exports.default = gulp.parallel(
  fonts,
  _sprite,
  _watch
)