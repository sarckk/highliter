const path = require('path');

module.exports = {
  entry: ['./index.js', './src/component/HighlightMenu/menu.css'],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
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
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].build.css',
              context: './',
              outputPath: '/',
              publicPath: '/dist'
            }
          },
          {
            loader: 'extract-loader'
          },
          {
            loader: 'css-loader'
          }
        ]
      }
    ]
  },
  devtool: 'eval-source-map'
};
