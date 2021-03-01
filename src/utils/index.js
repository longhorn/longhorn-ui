// import classnames from 'classnames'
// import config from './config'
// import menu from './menu'
// import request from './request'
let request = require('./request').default
let menu = require('./menu')
let config = require('./config')
let classnames = require('classnames')

String.prototype.hyphenToHump = function () {
  return this.replace(/-(\w)/g, (...args) => {
    return args[1].toUpperCase()
  })
}

String.prototype.firstUpperCase = function () {
  return this.replace(/\b(\w)(\w*)/g, ($0, $1, $2) => {
    return $1.toUpperCase() + $2.toLowerCase()
  })
}

String.prototype.humpToHyphen = function () {
  return this.replace(/([A-Z])/g, '-$1').toLowerCase()
}

String.prototype.humpToSpace = function () {
  return this.replace(/([A-Z])/g, ' $1').toLowerCase()
}

String.prototype.trimLeftAndRight = function () {
  return this.replace(/(^\s*)|(\s*$)/g, '')
}

Date.prototype.format = function (format) {
  const o = {
    'M+': this.getMonth() + 1,
    'd+': this.getDate(),
    'h+': this.getHours(),
    'H+': this.getHours(),
    'm+': this.getMinutes(),
    's+': this.getSeconds(),
    'q+': Math.floor((this.getMonth() + 3) / 3),
    S: this.getMilliseconds(),
  }
  if (/(y+)/.test(format)) {
    format = format.replace(RegExp.$1, `${this.getFullYear()}`.substr(4 - RegExp.$1.length))
  }
  for (let k in o) {
    if (new RegExp(`(${k})`).test(format)) {
      format = format.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : (`00${o[k]}`).substr(`${o[k]}`.length))
    }
  }
  return format
}

module.exports = {
  config,
  menu,
  request,
  classnames,
}
