const path = require('path')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const OptimizeCssAssetsWebpaclPlugin = require('optimize-css-assets-webpack-plugin')
const TerserWebpackPlugin = require('terser-webpack-plugin')
const ImageminPlugin = require('imagemin-webpack')
const paths = require('./package.json').paths

const isDev = process.env.NODE_ENV === 'development'
const isProd = !isDev

const filename = ext => isDev ? `[name].${ext}` : `[name].[contenthash].${ext}`

const optimization = () => {
  const configObj = {
    splitChunks: {
      chunks: 'all'
    }
  }

  if (isProd) {
    configObj.minimizer = [
      new OptimizeCssAssetsWebpaclPlugin(),
      new TerserWebpackPlugin()
    ]
  }

  return configObj
}

const plugins = () => {
  const basePlugins = [
    new HTMLWebpackPlugin({
      template: path.resolve(__dirname, paths.src + '/pug/pages/index.pug'),
      filename: path.resolve(__dirname, paths.dist + '/index.html'),
      minify: {
        collapseWhitespace: isProd
      }
    }),
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: `./css/${filename('css')}`
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, paths.src + '/assets'),
          to: path.resolve(__dirname, paths.dist )
        }
      ]
    })
  ]

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
  entry: './js/main.js',
  output: {
    filename: `./js/${filename('js')}`,
    path: path.resolve(__dirname, paths.dist),
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
      '@assets': path.resolve(__dirname, paths.src + '/assets')
    }
  },
  devServer: {
    port: 4200,
    hot: true,
    inline: true
  },
  optimization: optimization(),
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
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: isDev
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
        test: /\.(jp(e*)g|png|gif|webp)$/,
        exclude: '/src/assets/',
        loader: 'file-loader',
        options: {
          name: `./img/${filename('[ext]')}`
        }
      },
      {
        test: /\.svg$/,
        include: /.*sprite\.svg/,
        loader: 'file-loader',
        options: {
          name: `./img/${filename('[ext]')}`
        }
      },
      {
        test: /\.(woff(2*)|eot|ttf)$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: './fonts/[name].[ext]'
        }
      },
      {
        test: /\.js$/i,
        exclude: '/node_modules/',
        use: ['babel-loader']
      }
    ]
  }
}