import { request } from '../utils'

export async function query(params) {
  return request({
    url: '/v1/backup',
    method: 'get',
    data: params,
  })
}
