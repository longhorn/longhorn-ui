import { request } from '../utils'

export async function query(params) {
  return request({
    url: '/v1/recurringjobs',
    method: 'get',
    data: params,
  })
}

export async function create(params) {
  return request({
    url: '/v1/recurringjobs',
    method: 'post',
    data: {
      ...params,
    },
  })
}

export async function update(params) {
  return request({
    url: `/v1/recurringjobs/${params.name}`,
    method: 'put',
    data: {
      ...params,
    },
  })
}

export async function deleteRecurringJob(params) {
  if (params.name) {
    return request({
      url: `/v1/recurringjobs/${params.name}`,
      method: 'delete',
    })
  }
}
