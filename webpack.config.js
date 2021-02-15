const path = require('path')
const paths = require('./package.json').paths
const HTMLWebpackPlugin = require('html-webpack-plugin')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const ImageminPlugin = require('imagemin-webpack')

const fs = require('fs')

const isDev = process.env.NODE_ENV === 'development'
const isProd = !isDev

const filename = ext => isDev ? `[name].${ext}` : `[name].[contenthash].${ext}`

const cb = () => {

}

const length = mass => {
  let count = 0

  mass.forEach((index, value) => {
    count = value
  })

  return count
}

const addPage = (page) => {
  return new HTMLWebpackPlugin({
    template: path.resolve(__dirname, paths.src + `/pug/pages/${page}.pug`),
    filename: path.resolve(__dirname, paths.dist + `/${page}.html`),
    inject: page !== 'layout.map',
    minify: {
      collapseWhitespace: isProd
    }
  })
}

const plugins = () => {
  const basePlugins = [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: `./css/${filename('css')}`
    }),
    new CopyWebpackPlugin({
      patterns: [
        {from: path.resolve(__dirname, paths.src + '/assets'), to: path.resolve(__dirname, paths.dist)}
      ]
    })
  ]


  const pagesConfinUrl = paths.src + '/js/modules/pages.config.json'
  const pages = fs.readdirSync(paths.src + '/pug/pages')
  let pagesArray = {pages: []}

  fs.writeFile( pagesConfinUrl, '', cb)

  pages.forEach(file => {
    file = file.split('.')

    let newFile = ''

    if (length(file) > 1) {
      for (let i=0; i < length(file); i++) {
        let dotFile = '.'

        if (i===0) {
          dotFile = ''
        }

        newFile += dotFile + file[i]
      } 
    } else {
      newFile = file[0]
    }

    pagesArray.pages.push(newFile)
    basePlugins.push(addPage(newFile))
  })

  fs.appendFile(pagesConfinUrl, JSON.stringify(pagesArray), cb)

  if (isProd) {
    basePlugins.push(
      new ImageminPlugin({
        bail: false,
        cache: true,
        imageminOptions: {
          plugins: [
            ["gifsicle", { interlaced: true }],
            ["jpegtran", { progressive: true }],
            ["optipng", { optimizationLevel: 5 }]
          ]
        }
      })
    )
  }

  return basePlugins
}

const preprocessor = (items) => {
  const config = [
    {
      loader: MiniCssExtractPlugin.loader,
      options: {
        publicPath: (resourcePath, context) => {
          return path.relative(path.dirname(resourcePath), context) + '/'
        }
      }
    },
    'css-loader',
    {
      loader: 'postcss-loader',
      options: {
        postcssOptions: {
          config: path.resolve(__dirname, 'postcss.config.js')
        }
      }
    }
  ]

  if (items) {
    config.push(items)
  }

  return config
}

module.exports = {
  context: path.resolve(__dirname, paths.src),
  mode: 'development',
  entry: [
    './js/main.js'
  ],
  output: {
    filename: `./js/${filename('js')}`,
    path: path.resolve(__dirname, `${paths.dist}/`),
    publicPath: ''
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, paths.src),
      '@img': path.resolve(__dirname, paths.src + '/img'),
      '@pug': path.resolve(__dirname, paths.src + '/pug'),
      '@fonts': path.resolve(__dirname, paths.src + '/fonts'),
      '@scss': path.resolve(__dirname, paths.src + '/scss'),
      '@modules': path.resolve(__dirname, paths.src + '/js/modules'),
      '@js': path.resolve(__dirname, paths.src + '/js'),
      '@video': path.resolve(__dirname, paths.src + '/video'),
      '@assets': path.resolve(__dirname, paths.src + '/assets')
    }
  },
  plugins: plugins(),
  devtool: isProd ? false : 'source-map',
  module: {
    rules: [
      {
        test: /\.pug$/,
        loader: 'pug-loader',
        options: {
          pretty: true,
          root: path.resolve(__dirname, paths.src + '/pug')
        }
      },
      {
        test: /\.css$/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                config: path.resolve(__dirname, 'postcss.config.js')
              }
            }
          }
        ]
      },
      {
        test: /\.s[ac]ss$/i,
        use: preprocessor('sass-loader')
      },
      {
        test: /\.less$/i,
        use: preprocessor('less-loader')
      },
      {
        test: /\.(jp(e*)g|png|gif|webp|mp4)$/,
        exclude: path.resolve(__dirname, paths.src + '/assets/' ),
        loader: 'file-loader',
        options: {
          name: `[path]${filename('[ext]')}`
        }
      },
      {
        test: /\.svg$/,
        include: /.*sprite\.svg/,
        loader: 'file-loader',
        options: {
          name: `[path]${filename('[ext]')}`
        }
      },
      {
        test: /\.(woff(2*)|eot|ttf)$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: '[path][name].[ext]'
        }
      },
      {
        test: /\.js$/i,
        exclude: '/node_modules/',
        use: ['babel-loader']
      }
    ]
  },
  devServer: {
    contentBase: paths.dist,
    hot: true,
    compress: true,
    port: 4200
  },
  target: isDev ? 'web' : 'browserslist'
}