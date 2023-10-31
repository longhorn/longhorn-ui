import { request } from '../utils'

export async function listSecrets() {
  return request({
    url: '/v1/secrets',
    method: 'get',
  })
}
