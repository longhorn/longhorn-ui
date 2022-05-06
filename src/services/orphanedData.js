import { request } from '../utils'

export async function query(params) {
  if (params) {
    return request({
      url: `/v1/orphans/${params.name}`,
      method: 'get',
    })
  }
  return request({
    url: '/v1/orphans',
    method: 'get',
  })
}

export async function deleteOrphaned(params) {
  return request({
    url: `/v1/orphans/${params.name}`,
    method: 'delete',
  })
}
