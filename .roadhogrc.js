const endpoint = process.env.LONGHORN_ORC_IP || 'http://54.223.25.181:9500/';
export default {
  "entry": "src/index.js",
  "disableCSSModules": false,
  "multipage": false,
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
