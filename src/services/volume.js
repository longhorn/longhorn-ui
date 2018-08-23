import { request } from '../utils'

export async function query(params) {
  return request({
    url: '/v1/volumes',
    method: 'get',
    data: params,
  })
}

export async function execAction(url, params, silence = false) {
  return request({
    url,
    method: 'post',
    data: params,
    silence,
  })
}

export async function create(params) {
  return request({
    url: '/v1/volumes',
    method: 'post',
    data: {
      ...params,
      staleReplicaTimeout: 20,
      size: `${params.size}Gi`,
      fromBackup: '',
    },
  })
}

export async function deleteVolume(params) {
  return request({
    url: params.links.self,
    method: 'delete',
  })
}

export async function recurringUpdate(data, url) {
  return request({
    url,
    method: 'post',
    data,
  })
}

export async function getVolume(volumeName) {
  return request({
    url: `/v1/volumes/${volumeName}`,
    method: 'get',
  })
}
