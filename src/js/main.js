import '@scss/main.scss'

import {pages} from '@modules/pages.config.json'
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