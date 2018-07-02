import { request } from '../utils'

export async function query(params) {
  return request({
    url: '/v1/nodes',
    method: 'get',
    data: params,
  })
}

export async function toggleScheduling(data) {
  return request({
    url: data.links.self,
    method: 'put',
    data,
  })
}
