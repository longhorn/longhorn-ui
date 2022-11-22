import { request } from '../utils'

export async function querySystembackups() {
  return request({
    url: '/v1/systembackups',
    method: 'get',
  })
}

export async function createSystembackups(params) {
  if (params) {
    return request({
      url: '/v1/systembackups',
      method: 'post',
      data: params,
    })
  }
}

export async function deleteSystembackups(params) {
  return request({
    url: `/v1/systembackups/${params.name}`,
    method: 'delete',
  })
}

export async function querySystemrestores() {
  return request({
    url: '/v1/systemrestores',
    method: 'get',
  })
}

export async function createSystemrestores(params) {
  if (params) {
    return request({
      url: '/v1/systemrestores',
      method: 'post',
      data: params,
    })
  }
}

export async function deleteSystemRestores(params) {
  return request({
    url: `/v1/systemrestores/${params.name}`,
    method: 'delete',
  })
}

export async function createSystemRestore(params) {
  if (params) {
    return request({
      url: '/v1/systemrestores',
      method: 'post',
      data: params,
    })
  }
}
