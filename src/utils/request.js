import axios from 'axios'
import qs from 'qs'
import { message } from 'antd'
import C from '../utils/constants'
message.config({
  top: 60,
  duration: 5,
})

const config = {
  baseURL: window.__pathname_prefix__, // eslint-disable-line no-underscore-dangle
  headers: {
    Accept: 'application/json',
  },
}
const fetch = (options) => {
  let {
    method = 'get',
    data,
    url,
  } = options
  url = url ? url.replace(C.RegExp.REQUEST, '') : ''

  switch (method.toLowerCase()) {
    case 'get':
      return axios.get(`${url}${options.data ? `?${qs.stringify(options.data)}` : ''}`, config)
    case 'delete':
      return axios.delete(url, { ...config, data })
    case 'post':
      return axios.post(url, data, config)
    case 'put':
      return axios.put(url, data, config)
    default:
      return axios(options)
  }
}

export default function request(options) {
  return fetch(options).then((response) => {
    const { statusText, status } = response
    let data = options.isCross ? response.data.query.results.json : response.data
    return {
      code: 0,
      status,
      message: statusText,
      ...data,
    }
  }, (error) => {
    if (!options.silence) {
      message.error(error.response.data.message || error.message)
    }
  }).catch((error) => {
    const { response = { statusText: 'Network Error' } } = error
    return { code: 1, message: response.statusText }
  })
}
