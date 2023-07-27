import { request } from '../utils'

export async function query(params) {
  return request({
    url: '/v1/events',
    method: 'get',
    data: params,
  })
}
