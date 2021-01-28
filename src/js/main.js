import '@scss/main.scss'

const pages = require('@modules/pages.config.json').pages
pages.forEach((file) => {
  require(`@pug/pages/${file}.pug`)
})

import loadSprite from '@modules/loadSprite'
import SVGSprite from '@img/sprite.svg'

if (SVGSprite) {
  loadSprite(SVGSprite, {
    fill: false
  })
}