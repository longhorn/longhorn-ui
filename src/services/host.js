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

export async function updateDisk(data, url) {
  return request({
    url,
    method: 'post',
    data,
  })
}

export async function deleteHost(data) {
  return request({
    url: data.links.self,
    method: 'delete',
  })
}

export async function getInstancemanagers() {
  return request({
    url: '/v1/instancemanagers',
    method: 'get',
  })
}
