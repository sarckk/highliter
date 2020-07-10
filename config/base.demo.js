const path = require('path');
const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const baseConfig = require('./base');
const { rootDir } = require('./constants');

const demoDir = path.resolve(rootDir, 'demo');

const config = {
  entry: [path.resolve(demoDir, 'index.js')],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(demoDir, 'index.html')
    })
  ],
  output: {
    path: path.resolve(demoDir, 'dist'),
    filename: 'index.js'
  },
  externals: {
    jscolor: 'jscolor'
  }
};

module.exports = merge(baseConfig, config);
