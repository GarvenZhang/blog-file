const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')

const rootDir = process.cwd()

module.exports = {
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(rootDir, './client/game-login/index.html'),
      inject: true,
      minify: {
        removeComment: true,
        collapseWhitespage: true
      },
      chunks: [
        'game-login'
      ],
      filename: 'game-login.html'
    }),

    new HtmlWebpackPlugin({
      template: path.resolve(rootDir, './client/resume/index.html'),
      inject: true,
      minify: {
        removeComment: true,
        collapseWhitespage: true
      },
      filename: 'resume.html'
    }),

    new HtmlWebpackPlugin({
      template: path.resolve(rootDir, './client/secret-login/index.html'),
      inject: true,
      minify: {
        removeComment: true,
        collapseWhitespage: true
      },
      chunks: [
        'secret-login'
      ],
      filename: 'secret-login.html'
    })
  ]
}
