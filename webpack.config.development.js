/* eslint-disable */
const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { WebpackManifestPlugin } = require("webpack-manifest-plugin");
const theme = require("./src/theme");
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
var FriendlyErrorsWebpackPlugin = require('@soda/friendly-errors-webpack-plugin');
const endpoint = process.env.LONGHORN_MANAGER_IP || 'http://54.223.25.181:9500/';


module.exports = {
  entry: path.resolve(__dirname, "src", "index.js"),
  devServer: {
    // contentBase: path.resolve(__dirname, 'dist'),
    host: "0.0.0.0",
    port: 8080,
    open: false,
    hot: true,
    historyApiFallback: true,
    proxy: {
      proxyTimeout: 10 * 60 * 1000,
      timeout: 10 * 60 * 1000,
      "/v1/ws/**": {
        "target": endpoint,
        "changeOrigin": true,
        "ws": true,
        "secure": false
      },
      "/v1/": {
        "target": endpoint,
        "changeOrigin": true
      },
    }
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
    publicPath: "/",
    chunkFilename: "[name].async.js",
    library: "[name]_dll",
    clean: true
  },
  resolve: {
    alias: {
      components: path.resolve(__dirname, "src/components/"),
      layouts: path.resolve(__dirname, "src/layouts/"),
      utils: path.resolve(__dirname, "src/utils/"),
      services: path.resolve(__dirname, "src/services/"),
      routes: path.resolve(__dirname, "src/routes/"),
      models: path.resolve(__dirname, "src/models/")
    },
    fallback: {
      fs: false,
      path: false,
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [path.resolve(__dirname, "src")],
        exclude: [],
        loader: "babel-loader",
        options: {
          cacheDirectory: true
        }
      },
      {
        test: /\.css$/,
        use: [
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
          "style-loader",
          {
            loader: "css-loader",
            options: {
              sourceMap: true,
              importLoaders: 1,
              modules: {
                localIdentName: "[name]_[local]-[hash:base64:5]"
              },
            }
          },
          {
            loader: "less-loader",
            options: {
              lessOptions: {
                sourceMap: true,
                javascriptEnabled: true,
                math: "always",
                modifyVars: theme()
              } 
            }
          }
        ],
        exclude: /node_modules/
      },
      {
        test: /\.less$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              sourceMap: true,
              importLoaders: 1,
              modules: {
                localIdentName: "[name]_[local]-[hash:base64:5]"
              },
            }
          },
          {
            loader: "less-loader",
            options: {
              lessOptions: {
                sourceMap: true,
                javascriptEnabled: true,
                math: "always",
                modifyVars: theme()
              } 
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
  devtool: false,
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
    new ProgressBarPlugin(),
    new FriendlyErrorsWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: '[id].css'
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "src", "index.ejs"),
      filename: "index.html",
      hash: true
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "public")
        }
      ]
    }),
    new webpack.HotModuleReplacementPlugin(),
    new WebpackManifestPlugin(),
    new webpack.SourceMapDevToolPlugin({})
  ]
};
