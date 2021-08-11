import { request } from '../utils'

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

    xhr.open('post', url)
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
