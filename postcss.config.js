const isDev = process.env.NODE_ENV === 'development'
const isProd = !isDev

const plugins = () => {
  const config = {
    plugins: [
      require('autoprefixer'),
      require('css-mqpacker'),
    ]
  }

  if (isProd) {
    config.plugins.push(
      require('cssnano')({
        preset: [
          'default', {
            discardCommnets: {
              removeAll: true
            }
          }
        ]
      })
    )
  }

  return config
}

module.exports = plugins()