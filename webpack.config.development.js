/* eslint-disable */
const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ManifestPlugin = require("webpack-manifest-plugin");
const theme = require("./src/theme");
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const endpoint = process.env.LONGHORN_MANAGER_IP || 'http://54.223.25.181:9500/';


module.exports = {
  entry: path.resolve(__dirname, "src", "index.js"),
  devServer: {
    // contentBase: path.resolve(__dirname, 'dist'),
    host: "localhost",
    port: 8080,
    open: true,
    hot: true,
    historyApiFallback: true,
    client: {
      overlay: true,
    },
    devMiddleware: {
      stats: {
        children: false,
        chunks: false,
        assets: false,
        modules: false
      },
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
    },
    fallback: {
      path: require.resolve( 'path-browserify' ),
      url: require.resolve('url')
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [path.resolve(__dirname, "src")],
        exclude: [],
        loader: "babel-loader",
        options: {
          cacheDirectory: true,
        }
      },
      {
        test:/\.(c|le)ss$/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: "css-loader",
            options: {
              sourceMap: true,
              importLoaders: 1,
              modules: {
                namedExport: false,
                localIdentName: "[name]_[local]-[hash:base64:5]"
              },
            }
          },
          {
            loader: "less-loader",
            options: {
              sourceMap: true,
              lessOptions: {
                javascriptEnabled: true,
                modifyVars: theme()
              }
            }
          }
        ],
        exclude: /node_modules/
      },
      {
        test:/\.(c|le)ss$/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: "css-loader",
            options: {
              sourceMap: true,
              importLoaders: 1,
            }
          },
          {
            loader: "less-loader",
            options: {
              sourceMap: true,
              lessOptions: {
                namedExport: true,
                javascriptEnabled: true,
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
    new ProgressBarPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: '[id].css',
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "src", "index.ejs"),
      filename: "index.html",
      scriptLoading: "blocking",
      inject: "body",
      hash: true
    }),
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "public")
        },
      ],
    }),
    new webpack.HotModuleReplacementPlugin(),
    new ManifestPlugin.WebpackManifestPlugin()
  ]
};
