import { request } from '../utils'

export async function getSupportbundles(data) {
  return request({
    url: '/v1/supportbundles',
    method: 'post',
    data,
  })
}

export async function getSupportbundlesStepTwo(id, params) {
  return request({
    url: `/v1/supportbundles/${id}/${params.name}`,
    method: 'get',
  })
}
