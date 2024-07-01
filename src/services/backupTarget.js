import { request } from '../utils'

export async function queryBackupTarget(params) {
  return request({
    url: '/v1/backuptargets',
    method: 'get',
    data: params,
  })
}

export async function createBackupTarget(params) {
  return request({
    url: '/v1/backuptargets',
    method: 'post',
    data: params,
  })
}

export async function updateBackupTarget(params) {
  return request({
    url: `/v1/backuptargets/${params.name}?action=backupTargetUpdate`,
    method: 'post',
    data: { ...params },
  })
}

export async function deleteBackupTarget(params) {
  return request({
    url: `/v1/backuptargets/${params.name}`,
    method: 'delete',
  })
}

export async function execAction(url, params) {
  return request({
    url,
    method: 'post',
    data: params,
  })
}
