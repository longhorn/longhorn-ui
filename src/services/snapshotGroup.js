import { request } from '../utils'

export async function query(params) {
  return request({
    url: '/v1/snapshotgroups',
    method: 'get',
    data: params,
  })
}

export async function get(name) {
  return request({
    url: `/v1/snapshotgroups/${name}`,
    method: 'get',
  })
}

export async function create(params) {
  return request({
    url: '/v1/snapshotgroups',
    method: 'post',
    data: params,
  })
}

export async function preview(params) {
  return request({
    url: '/v1/snapshotgroups?action=preview',
    method: 'post',
    data: params,
  })
}

export async function deleteSnapshotGroup(params) {
  return request({
    url: `/v1/snapshotgroups/${params.name}`,
    method: 'delete',
  })
}
