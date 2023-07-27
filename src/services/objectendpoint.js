import { request } from '../utils'

export async function listObjectEndpoints() {
  return request({
    url: '/v1/objectendpoints',
    method: 'get',
  })
}

export async function getObjectEndpoint(name) {
  return request({
    url: `/v1/objectendpoints/${name}`,
    method: 'get',
  })
}

export async function createObjectEndpoint(params) {
  return request({
    url: '/v1/objectendpoints',
    method: 'put',
    data: params,
  })
}

export async function deleteObjectEndpoint(name) {
  return request({
    url: `/v1/objectendpoints/${name}`,
    method: 'delete',
  })
}
