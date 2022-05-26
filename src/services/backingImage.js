import { request } from '../utils'
import C from '../utils/constants'

export async function query(params) {
  return request({
    url: '/v1/backingimages',
    method: 'get',
    data: params,
  })
}

export async function create(params) {
  return request({
    url: '/v1/backingimages',
    method: 'post',
    data: {
      ...params,
    },
  })
}

export async function deleteBackingImage(params) {
  if (params.actions && params.actions.backingImageCleanup) {
    return request({
      url: params.actions.backingImageCleanup,
      method: 'delete',
    })
  }
}

export async function download(params) {
  if (params && params.name) {
    window.location.href = `${ window.__pathname_prefix__ }${ window.__pathname_prefix__.endsWith('/') ? '' : '/'}v1/backingimages/${params.name}/download` // eslint-disable-line
  }
}

export async function deleteDisksOnBackingImage(params) {
  if (params.selected && params.selected.actions && params.selected.actions.backingImageCleanup) {
    return request({
      url: params.selected.actions.backingImageCleanup,
      method: 'post',
      data: {
        disks: params.rows.map(item => item.disk),
      },
    })
  }
}

export async function uploadChunk(url, params, headers, onProgress) {
  return new Promise((resolve) => {
    // eslint-disable-next-line no-undef
    const xhr = new XMLHttpRequest()
    // Manually splicing upload file path
    let uploadUrl = url ? url.replace(C.RegExp.REQUEST, '') : ''
    let baseUrl = window.__pathname_prefix__ // eslint-disable-line no-underscore-dangle
    uploadUrl = baseUrl.endsWith('/') ? `${baseUrl.substr(0, baseUrl.length - 1)}${uploadUrl}` : `${baseUrl}${uploadUrl}`
    xhr.open('post', uploadUrl)
    xhr.upload.onprogress = (e) => { onProgress(e) }
    Object.keys(headers).forEach(key => xhr.setRequestHeader(key, headers[key]))
    xhr.send(params)
    xhr.onload = e => {
      if (e.target) {
        resolve({
          data: e.target.response,
          code: e.target.status,
        })
      }
    }
  })
}
