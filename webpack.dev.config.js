const path = require("path");
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = {
    entry: {
      dev: ["./example/app.js"]
    },
    output: {
      filename: "app.js",
      path: path.resolve(__dirname, "example"),
      publicPath: "/assets/",
    },
    resolve: {
      extensions: ['.js', '.jsx'],
      alias: {
        'react': path.resolve('node_modules/react'),
        'monaco-editor': path.resolve('node_modules/monaco-editor/esm/vs/editor/editor.main.js'),
      },
    },
    module: {
      rules: [
        {
          test: /(\.js?$)|(\.jsx?$)/,
          use: 'babel-loader',
          exclude: /node_modules/
        },
        {
          test: /\.css$/,
				  use: ['style-loader', 'css-loader']
        }
      ]
    },
    mode: 'development',
    devtool: 'inline-source-map',
    plugins: [new MonacoWebpackPlugin()],
    devServer: {
      static: [
        {
          directory: path.join(__dirname, 'example'),
          publicPath: "/",
        },
        {
          directory: path.join(__dirname, 'example'),
          publicPath: "/assets/",
        },
      ],
      historyApiFallback: true
    }
}