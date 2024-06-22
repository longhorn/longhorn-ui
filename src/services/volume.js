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

export async function getVolume(volumeName) {
  return request({
    url: `/v1/volumes/${volumeName}`,
    method: 'get',
  })
}

export async function createVolumePV(data, url) {
  return request({
    url,
    method: 'post',
    data,
  })
}

export async function createVolumePVC(data, url) {
  return request({
    url,
    method: 'post',
    data,
  })
}

export async function createVolumeAllPVC(data, url) {
  return request({
    url,
    method: 'post',
    data,
  })
}

export async function volumeActivate(data, url) {
  return request({
    url,
    method: 'post',
    data,
  })
}

export async function getNodeTags() {
  return request({
    url: '/v1/nodetags',
    method: 'get',
  })
}

export async function getDiskTags() {
  return request({
    url: '/v1/disktags',
    method: 'get',
  })
}

export async function expandVolume(params) {
  return request({
    url: params.url,
    method: 'post',
    data: {
      ...params.data,
    },
  })
}

export async function cancelExpansion(params) {
  return request({
    url: params.url,
    method: 'post',
    data: {
      name: params.name,
    },
  })
}

export async function createRecurringJob(params) {
  return request({
    url: '/v1/recurringjobs',
    method: 'post',
    data: {
      ...params,
    },
  })
}

export async function recurringJobAdd(params) {
  return request({
    url: params.url,
    method: 'post',
    data: {
      name: params.name,
      isGroup: params.isGroup,
    },
  })
}

export async function removeVolumeRecurringJob(params) {
  return request({
    url: params.url,
    method: 'post',
    data: {
      name: params.name,
      isGroup: params.isGroup,
    },
  })
}

export async function getVolumeRecurringJobList(url) {
  return request({
    url,
    method: 'post',
  })
}

export async function updateRecurringJob(params) {
  return request({
    url: `/v1/recurringjobs/${params.name}`,
    method: 'put',
    data: {
      ...params,
    },
  })
}
