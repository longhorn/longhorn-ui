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
    "/v1/volumes": {
      "target": "http://54.223.25.181:9500/",
      "changeOrigin": false
    },
    "/v1/hosts": {
      "target": "http://54.223.25.181:9500/",
      "changeOrigin": false
    },
    "/v1/settings": {
      "target": "http://54.223.25.181:9500/",
      "changeOrigin": false
    }
  },
  "theme": "./src/theme.js"
}
