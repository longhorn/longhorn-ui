const endpoint = process.env.LONGHORN_MANAGER_IP || 'http://54.223.25.181:9500/';
export default {
  "entry": "src/index.js",
  "disableCSSModules": false,
  "extraBabelPlugins": [
    ['import', { libraryName: 'antd', libraryDirectory: 'es', style: true }], 
  ],
  "env": {
  },
  "proxy": {
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
  },
  "theme": "./src/theme.js",
  "html": {
    "template": "./src/index.ejs"
  },
  "publicPath": "/",
  "es5ImcompatibleVersions": true,
}
