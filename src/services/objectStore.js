import { request } from '../utils'

export async function listObjectStores() {
  return request({
    url: '/v1/objectstores',
    method: 'get',
  })
}

export async function getObjectStore(name) {
  return request({
    url: `/v1/objectstores/${name}`,
    method: 'get',
  })
}

export async function createObjectStore(params) {
  return request({
    url: '/v1/objectstores',
    method: 'post',
    data: params,
  })
}

export async function deleteObjectStore(params) {
  if (params.name) {
    return request({
      url: `/v1/objectstores/${params.name}`,
      method: 'delete',
    })
  }
}
