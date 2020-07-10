const path = require('path');
const { rootDir } = require('./constants');

const config = {
  entry: [path.resolve(rootDir, 'src/index.js')],
  output: {
    path: path.resolve(rootDir, 'dist'),
    library: 'highliter',
    libraryTarget: 'umd',
    libraryExport: 'default'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env',
                {
                  plugins: ['@babel/plugin-proposal-class-properties']
                }
              ]
            }
          },
          'eslint-loader'
        ]
      }
    ]
  }
};

module.exports = config;
