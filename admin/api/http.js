import axios from 'axios'
import qs from 'qs'
import { Message } from 'element-ui'
import { getToken } from '@/utils/auth'

// import {Message} from 'element-ui'

// const baseUrl = 'http://192.168.0.138:9010/cloudmap2.api/'
const baseUrl = process.env.VUE_APP_BASE_API
// if (process.env.NODE_ENV === 'development') {
//   baseUrl = '';
// }
class HTTP {
  constructor() {
    this.xhr = axios.create({
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        timeout: 30000,
        withCredentials: true
      }
    })

    this.xhr.interceptors.request.use((opts) => {
      // 判断链接是否http或者https开头
      const isHttp = /^(http|https):\/\//.test(opts.url)
      opts.url = (isHttp ? '' : baseUrl) + opts.url
      return opts
    }, function(error) {
      return Promise.reject(error)
    })

    this.xhr.interceptors.response.use((response) => {
      return response
    }, (error) => {
      return Promise.resolve(error.response)
    })
  }

  request(opts) {
    if (getToken()) {
      opts.headers = {
        'X-Authentication-Token': getToken(),
        ...opts.headers
      }
    }
    return this.xhr.request(opts)
      .then(this.checkStatus)
      .then(this.checCode)
  }

  getParams(url, opts) {
    opts = opts || {}
    opts.method = 'get'
    opts.url = url

    return this.request(opts)
  }

  /**
	 * created by zxl
	 * 给get请求动态添加参数
	 * @param url
	 * @param params
	 *
	 */
  get(url, params, opts) {
    if (params && Object.keys(params).length) {
      url += '?'
      const searchText = []
      Object.keys(params).map((p, index) => {
        if (params[p] != undefined) {
          searchText.push(`${index ? '&' : ''}${p}=${params[p]}`)
        }
      })
      url += searchText.join('')
    }
    return this.getParams(url, opts)
  }

  put(url, params, opts) {
    opts = opts || {}
    if (params && Object.keys(params).length) {
      url += '?'
      const searchText = []
      Object.keys(params).map((p, index) => {
        if (params[p] != undefined) {
          searchText.push(`${index ? '&' : ''}${p}=${params[p]}`)
        }
      })
      url += searchText.join('')
    }
    opts.url = url
    opts.method = 'put'
    return this.request(url, opts)
  }

  delete(url, opts) {
    opts = opts || {}
    opts.method = 'delete'
    opts.url = url

    return this.request(opts)
  }

  postJsonParams(url, params, data, opts) {
    opts = opts || {}
    if (params && Object.keys(params).length) {
      url += '?'
      const searchText = []
      Object.keys(params).map((p, index) => {
        if (params[p] != undefined) {
          searchText.push(`${index ? '&' : ''}${p}=${params[p]}`)
        }
      })
      url += searchText.join('')
    }
    opts.url = url
    opts.method = 'post'
    opts.headers = {
      'Content-Type': 'application/json'
    }
    opts.data = data

    return this.request(opts)
  }

  postJson(url, data, opts) {
    opts = opts || {}
    opts.method = 'post'
    opts.url = url
    opts.headers = {
      'Content-Type': 'application/json'
    }
    opts.data = data

    return this.request(opts)
  }

  putJsonHeader(url, data, opts) {
    opts = opts || {}
    opts.method = 'put'
    opts.url = url
    opts.headers = opts.merchantId ? {
      'Content-Type': 'application/json',
      'merchantId': opts.merchantId
    } : {
      'Content-Type': 'application/json'
    }
    opts.data = data
    return this.request(opts)
  }

  post(url, data, opts) {
    if (!this.isMutipleClick(url, data)) {
      opts = opts || {}
      opts.method = 'post'
      opts.url = url
      opts.data = qs.stringify(data, {
        allowDots: true
      })
      return this.request(opts)
    }
  }

  upload(url, data, opts) {
    opts = opts || {}
    opts.method = 'post'
    opts.url = url
    opts.headers = {
      'Content-Type': 'multipart/form-data'
    }
    opts.data = data
    return this.request(opts)
  }

  sendForm(url, data, {
    method = 'POST',
    enctype = 'multipart/form-data',
    target = '_blank'
  } = {}) {
    const form = document.createElement('form')
    form.action = url
    form.method = method
    form.enctype = enctype
    form.target = target

    const setFiled = (key, val) => {
      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = key
      input.value = val
      form.appendChild(input)
    }

    for (const key in data) {
      setFiled(key, data[key])
    }

    document.body.appendChild(form)
    form.submit()
    document.body.removeChild(form)
  }

  checkStatus(response) {
    if (response.status === 200 || response.status === 304 || response.status === 400 || response.status === 500) {
      return response
    }
    if (response.status === 401) {
      document.title = '登陆'
      location.replace('/#/login')
      return
    }
    return {
      data: {
        code: 404,
        message: response.statusText || '404 NOT FOUND',
        data: response.statusText
      }
    }
  }

  checCode(response) {
    const data = response.data
    if (data.code === 0) {
      return data
    } else {
      Message.error(data.msg || 'Has Error')
    }
    return data
  }

  /**
	 * 防止重复提交
	 * TODO: 后续需要在按钮点击并且调用接口的参数中添加 isCheckClick: true/false
	 * 如果设置为true则进入此方法，如果设置false，则直接调用接口，不做限制
	 * @param {*} url
	 * @param {*} data
	 */
  isMutipleClick(url, data) {
    if (data && data.disableDoubleClick) {
      delete data.disableDoubleClick
      data = data || {}
      let res = false
      const {
        urls = [], params = []
      } = global.interface || {}
      let index = urls.indexOf(url)
      // 如果存在，如果有参数，并且接口和参数都存在的话，限制
      if (index > -1 && JSON.stringify(data) === params[index]) {
        res = true
      } else {
        index = urls.length
        urls.push(url)
        params.push(JSON.stringify(data))
        global.interface = {
          urls, params
        }
        const timer = setTimeout(() => {
          clearTimeout(timer)
          urls.splice(index, 1)
          params.splice(index, 1)
          global.interface = {
            urls, params
          }
        }, 1000)
      }
      return res
    }
    return false
  }
}

export default new HTTP()
