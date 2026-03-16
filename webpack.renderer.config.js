const rules = require('./webpack.rules');

rules.push({
  test: /\.jsx?$/,
  use: {
    loader: 'babel-loader',
    options: {
      presets: [
        '@babel/preset-env',
        '@babel/preset-react'
      ]
    }
  },
  exclude: /node_modules/
});

rules.push({
  test: /\.css$/,
  use: [
    { loader: 'style-loader' },
    { loader: 'css-loader' }
  ]
});

module.exports = {
  module: {
    rules,
  },
  resolve: {
    extensions: ['.js', '.jsx']
  }
};