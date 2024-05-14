import { request } from '../utils'

export async function query(params) {
  return request({
    url: '/v1/backupvolumes',
    method: 'get',
    data: params,
  })
}

export async function queryBackupList(name) {
  return request({
    url: `/v1/backupvolumes/${name}?action=backupList`,
    method: 'post',
  })
}

export async function queryTarget(params) {
  return request({
    url: '/v1/backuptargets',
    method: 'get',
    data: params,
  })
}

export async function createVolume(params) {
  return request({
    url: '/v1/volumes',
    method: 'post',
    data: params,
  })
}

export async function syncBackupVolume(volumeName) {
  return request({
    url: `/v1/backupvolumes/${volumeName}?action=backupVolumeSync`,
    method: 'post',
    data: {
      syncBackupVolume: true,
    },
  })
}

export async function syncAllBackupVolumes() {
  return request({
    url: '/v1/backupvolumes',
    method: 'put',
    data: {
      syncAllBackupVolumes: true,
    },
  })
}

export async function execAction(url, params) {
  return request({
    url,
    method: 'post',
    data: params,
  })
}

export async function restore(params) {
  return request({
    url: '/v1/volumes',
    method: 'post',
    data: {
      ...params,
      staleReplicaTimeout: 20,
    },
  })
}

export async function deleteBackup(payload) {
  return request({
    url: `/v1/backupvolumes/${payload.volumeName}?action=backupDelete`,
    method: 'post',
    data: {
      name: payload.name,
    },
  })
}

export async function deleteAllBackups(name) {
  return request({
    url: `/v1/backupvolumes/${name}`,
    method: 'delete',
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
