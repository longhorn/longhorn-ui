import { request } from '../utils'

export async function query(params) {
  return request({
    url: '/v1/engineimages',
    method: 'get',
    data: params,
  })
}

export async function create(params) {
  return request({
    url: '/v1/engineimages',
    method: 'post',
    data: {
      ...params,
    },
  })
}

export async function deleteEngineImage(params) {
  return request({
    url: params.links.self,
    method: 'delete',
  })
}

export async function getEngineImage(engineImageName) {
  return request({
    url: `/v1/engineimages/${engineImageName}`,
    method: 'get',
  })
}
