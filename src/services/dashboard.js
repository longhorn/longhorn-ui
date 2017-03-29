import { request } from '../utils'

export async function query(params) {
  return request({
    url: '/v1/dashboard',
    method: 'get',
    data: params,
  })
}
