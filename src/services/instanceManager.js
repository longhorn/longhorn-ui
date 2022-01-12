import { request } from '../utils'

export async function query(params) {
  return request({
    url: '/v1/instancemanagers',
    method: 'get',
    data: params,
  })
}
