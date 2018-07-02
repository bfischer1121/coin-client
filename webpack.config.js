const webpack = require('webpack');
const path = require('path');

const config = {
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },

  output: {
    libraryTarget: 'window'
  },
  mode: 'production',
  devtool: 'source-map',
  devServer: {
    compress: true,
    port: 9000
  }
};

const clientConfig = {
  ...config,
  name: 'client',
  target: 'web',

  entry: {
    client: ['@babel/polyfill', './src/index.js']
  },

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'lib.client.js'
  },

  plugins: [
    new webpack.DefinePlugin({ 'process.env.BROWSER': true }),
    new webpack.IgnorePlugin(/jayson\/promise/)
  ]
};

const serverConfig = {
  ...config,
  name: 'server',
  target: 'node',

  entry: {
    server: ['@babel/polyfill', './src/index.js']
  },

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'lib.server.js'
  },

  plugins: [
    new webpack.DefinePlugin({ 'process.env.BROWSER': false })
  ]
};

module.exports = [clientConfig, serverConfig];