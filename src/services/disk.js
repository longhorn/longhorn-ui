import { request } from '../utils'

export async function query(params) {
  return request({
    url: '/v1/disks',
    method: 'get',
    data: params,
  })
}

export async function createDisk(params) {
  return request({
    url: '/v1/disks',
    method: 'post',
    data: params,
  })
}

export async function deleteDisk(params) {
  return request({
    url: `/v1/disks/${params.id}`,
    method: 'delete',
  })
}

export async function updateDisk(params) {
  return request({
    url: `/v1/disks/${params.id}`,
    method: 'put',
    data: params,
  })
}
