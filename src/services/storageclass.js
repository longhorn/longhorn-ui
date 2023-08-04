import { request } from '../utils'

export async function listStorageClasses() {
  return request({
    url: '/v1/storageclasses',
    method: 'get',
  })
}
