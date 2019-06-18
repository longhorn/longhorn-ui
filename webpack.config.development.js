/* eslint-disable */
const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
var ManifestPlugin = require("webpack-manifest-plugin");
const theme = require("./src/theme");
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const OpenBrowserPlugin = require('open-browser-webpack-plugin');
var FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const endpoint = process.env.LONGHORN_MANAGER_IP || 'http://54.223.25.181:9500/';

// console.log('主题变量\r\n', theme);

module.exports = {
  entry: path.resolve(__dirname, "src", "index.js"),
  devServer: {
    // contentBase: path.resolve(__dirname, 'dist'),
    host: "0.0.0.0", // 主机地址
    port: 8080, // 端口号
    open: false,
    hot: true,
    quiet: true,
    historyApiFallback: true,
    overlay: {
      errors: true
    },
    stats: {
      children: false,
      chunks: false,
      assets: false,
      modules: false
    },
    proxy: {
      proxyTimeout: 10 * 60 * 1000,
      timeout: 10 * 60 * 1000,
      "/v1/ws/**": {
        "target": endpoint,
        "changeOrigin": false,
        "ws": true,
        "secure": false
      },
      "/v1/": {
        "target": endpoint,
        "changeOrigin": false
      },
    }
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
    publicPath: "/",
    chunkFilename: "[name].async.js",
    library: "[name]_dll"
  },
  resolve: {
    alias: {
      components: path.resolve(__dirname, "src/components/"),
      layouts: path.resolve(__dirname, "src/layouts/"),
      utils: path.resolve(__dirname, "src/utils/"),
      services: path.resolve(__dirname, "src/services/"),
      routes: path.resolve(__dirname, "src/routes/"),
      models: path.resolve(__dirname, "src/models/")
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [path.resolve(__dirname, "src")],
        exclude: [],
        loader: "babel-loader?cacheDirectory",
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: {
              importLoaders: 1
            }
          }
        ]
      },
      {
        test: /\.less$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: {
              sourceMap: true,
              importLoaders: 1,
              modules: true,
              localIdentName: "[name]_[local]-[hash:base64:5]"
            }
          },
          {
            loader: "less-loader",
            options: {
              sourceMap: true,
              javascriptEnabled: true,
              modifyVars: theme
            }
          }
        ],
        exclude: /node_modules/
      },
      {
        test: /\.less$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: {
              sourceMap: true,
              importLoaders: 1
            }
          },
          {
            loader: "less-loader",
            options: {
              sourceMap: true,
              javascriptEnabled: true,
              modifyVars: theme
            }
          }
        ],
        exclude: /src/
      },
      {
        test: /\.(ttf|eot|svg|woff|woff2|png|svg|jpg|gif)$/,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 8192
            }
          }
        ]
      }
    ]
  },
  externals: {
    jquery: "jQuery"
  },
  node: {
    fs: "empty",
    module: "empty"
  },
  devtool: "source-map",
  optimization: {
    splitChunks: {
      cacheGroups: {
        styles: {
          name: "styles",
          test: /\.(css|less)/,
          chunks: "all",
          enforce: true
        }
      }
    }
  },
  plugins: [
    new OpenBrowserPlugin({url: 'http://localhost:8080/'}),
    new ProgressBarPlugin(),
    new FriendlyErrorsWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: "[name].css"
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "src", "index.ejs"), // 模板
      filename: "index.html",
      hash: true // 防止缓存
    }),
    new CleanWebpackPlugin(["dist"]),
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, "public")
      }
    ]),
    new webpack.HotModuleReplacementPlugin(), // 调用webpack的热更新插件
    new ManifestPlugin()
  ]
};
