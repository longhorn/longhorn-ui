/* eslint-disable */
const pathname = window.location.pathname
const pathnamePattern = /\/k8s\/clusters\/.+?\/proxy\/?/g
const match = pathname.match(pathnamePattern)

if (match && match[0]) {
  let path = match[0]
  if (path.endsWith('/')) {
    path += '/'
  }
  __webpack_public_path__ = path
  window.__pathname_prefix__ = path
} else {
  window.__pathname_prefix__ = ''
}
