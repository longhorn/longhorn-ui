import { request } from '../utils'

export async function query(params) {
  return request({
    url: '/v1/settings',
    method: 'get',
    data: params,
  })
}

export async function update(params) {
  return request({
    url: params.links.self,
    method: 'put',
    data: params,
  })
}
