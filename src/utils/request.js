import axios from 'axios'
import qs from 'qs'
import { message } from 'antd'
message.config({
  top: 60,
  duration: 5,
})

const config = {
  headers: {
    Accept: 'application/json',
  },
}
const fetch = (options) => {
  const {
    method = 'get',
    data,
    url,
  } = options
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
    message.error(error.response.data.message)
  }).catch((error) => {
    const { response = { statusText: 'Network Error' } } = error
    return { code: 1, message: response.statusText }
  })
}
