const endpoint = process.env.LONGHORN || 'http://localhost:9500';
export default {
  "entry": "src/index.js",
  "disableCSSModules": false,
  "autoprefixer": null,
  "extraBabelPlugins": [
    "transform-runtime",
    [
      "import",
      {
        "libraryName": "antd",
        "style": true
      }
    ]
  ],
  "env": {
    "development": {
      "extraBabelPlugins": [
        "dva-hmr"
      ]
    }
  },
  "proxy": {
    "/v1/": {
      "target": endpoint,
      "changeOrigin": false
    },
  },
  "theme": "./src/theme.js"
}
