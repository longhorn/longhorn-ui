
/* eslint-disable */
const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HappyPack = require("happypack");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const ManifestPlugin = require("webpack-manifest-plugin");

const os = require("os");
const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length });

const theme = require("./src/theme");


module.exports = {
  devtool: 'source-map',
  entry: path.resolve(__dirname, "src", "index.js"),
  output: {
    filename: "[name].[chunkhash:8].js",
    path: path.resolve(__dirname, "dist"),
    publicPath: "./",
    chunkFilename: "[name].[chunkhash:8].async.js"
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
        exclude: /node_modules/,
        use: ["happypack/loader?id=babel"]
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
  stats: {
    children: false
  },
  performance: {
    hints: false
  },
  externals: {
    jquery: "jQuery"
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        styles: {
          name: "styles",
          test: /\.(css|less)/,
          chunks: "all",
          enforce: true
        },
        commons: {
          name: "commons",
          chunks: "initial",
          minChunks: 2
        },
        vendors: {
          name: "vendors",
          test: /[\\/]node_modules[\\/]/,
          priority: -10
        }
      }
    },
    moduleIds: 'deterministic',
    runtimeChunk: true
  },
  plugins: [
    new ProgressBarPlugin(),
    new ManifestPlugin.WebpackManifestPlugin(),
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
    new MiniCssExtractPlugin({
      filename: "[name].css"
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
      patterns: [{
        from: path.resolve(__dirname, "public")
      }]
    }),
    new CssMinimizerPlugin({
      test: /\.css$/g,
    }),
    new HappyPack({
      id: "babel",
      loaders: ["babel-loader?cacheDirectory"],
      threadPool: happyThreadPool
    }),
  ]
};
