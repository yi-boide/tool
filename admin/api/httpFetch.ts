import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
// @ts-ignore
import qs from 'qs';
import { IHttpData } from "../types";
import { getToken } from '@/utils/auth'
import { Message } from 'element-ui'

// import {Message} from 'element-ui'

// const baseUrl = 'http://192.168.0.138:9010/cloudmap2.api/'
const baseUrl = process.env.VUE_APP_BASE_API;

// if (process.env.NODE_ENV === 'development') {
//   baseUrl = '';
// }

class HTTPFetch {
  xhr: AxiosInstance

  constructor() {
    this.xhr = axios.create({
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        timeout: 30000,
        withCredentials: true
      }
    });

    this.xhr.interceptors.request.use((opts) => {
      // 判断链接是否http或者https开头
      const isHttp = /^(http|https):\/\//.test(opts.url)
      opts.url = (isHttp ? '' : baseUrl) + opts.url
      return opts;
    }, function (error) {
      return Promise.reject(error);
    });

    this.xhr.interceptors.response.use((response) => {
      return response
    }, (error) => {
      return Promise.resolve(error.response)
    });
  }

  request<T = any>(opts: AxiosRequestConfig): Promise<IHttpData<T>> {
    return new Promise((resolve, reject) => {
      if (getToken()) {
        opts.headers = {
          'X-Authentication-Token': getToken(),
          ...opts.headers
        }
      }
      this.xhr.request(opts)
        .then(res => {
          const data = this.checkStatus(res)
          data.code === 0 ? resolve(data) : reject(data)
        })
        .catch(res => {
          reject(res)
        })
    })
  }

  get<T = any>(url: string, params?: { [key: string]: any }, opts?: AxiosRequestConfig): Promise<IHttpData<T>> {
    opts = opts || {};
    opts.method = 'get';
    if (params && Object.keys(params).length) {
      url += '?'
      const searchText = []
      Object.keys(params).map((p, index) => {
        if (params[p] != undefined && params[p] !== '') {
          searchText.push(`${index ? '&' : ''}${p}=${params[p]}`)
        }
      })
      url += searchText.join('')
    }
    opts.url = url;

    return this.request<T>(opts);
  }

  // postjosn请求
  postJson<T = any>(url: string, data?: any, opts?: AxiosRequestConfig): Promise<IHttpData<T>> {
    opts = opts || {};
    opts.method = 'post';
    opts.url = url;
    opts.headers = { 'Content-Type': 'application/json' };
    opts.data = data;
    return this.request<T>(opts);
  }

  // put请求
  put<T = any>(url: string, params?: { [key: string]: any }, opts?: AxiosRequestConfig) {
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
    return this.request<T>(opts)
  }

  // delete请求
  delete<T = any>(url: string, opts?: AxiosRequestConfig) {
    opts = opts || {}
    opts.method = 'delete'
    opts.url = url
    return this.request<T>(opts)
  }

  postJsonParams<T = any>(url: string, params?: { [key: string]: any }, data?: { [key: string]: any }, opts?: AxiosRequestConfig) {
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
    return this.request<T>(opts)
  }

  post<T = any>(url: string, data?: any, opts?: AxiosRequestConfig): Promise<IHttpData<T>> {

    opts = opts || {};
    opts.method = 'post';
    opts.url = url;
    opts.data = qs.stringify(data, { allowDots: true });

    return this.request<T>(opts);
  }

  upload(url: string, data?: any, opts?: AxiosRequestConfig): Promise<IHttpData> {
    opts = opts || {};
    opts.method = 'post';
    opts.url = url;
    opts.headers = { 'Content-Type': 'multipart/form-data' };
    opts.data = data;
    return this.request(opts);
  }

  sendForm(url: string, data: any, { method = 'POST', enctype = 'multipart/form-data', target = '_blank' } = {}) {
    const form = document.createElement('form');
    form.action = url;
    form.method = method;
    form.enctype = enctype;
    form.target = target;

    const setFiled = (key: string, val: string) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = val;
      form.appendChild(input);
    };

    for (const key in data) {
      setFiled(key, data[key]);
    }

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  }

  checkStatus(response: AxiosResponse<IHttpData>) {
    if (response.status === 200 || response.status === 304 || response.status === 400 || response.status === 500) {
      return this.checkCode(response.data)
    }
    if (response.status === 401) {
      document.title = "登陆";
      location.replace('/#/login');
      return {
        code: -200,
        msg: "请先登陆",
        data: response.statusText,
      }
    }
    return {
      code: 404,
      msg: response.statusText || '404 NOT FOUND',
      data: response.statusText,
    }
  }

  checkCode(response: IHttpData) {
    const data = response;
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
  /*isMutipleClick(url: string, data?: { [key: string]: any }) {
      if (data && data.disableDoubleClick) {
          delete data.disableDoubleClick
          data = data || {}
          let res = false
          const {urls = [], params = []} = global.interface || {}
          let index = urls.indexOf(url)
          // 如果存在，如果有参数，并且接口和参数都存在的话，限制
          if (index > -1 && JSON.stringify(data) === params[index]) {
              res = true
          } else {
              index = urls.length
              urls.push(url)
              params.push(JSON.stringify(data))
              global.interface = {urls, params}
              const timer = setTimeout(() => {
                  clearTimeout(timer)
                  urls.splice(index, 1)
                  params.splice(index, 1)
                  global.interface = {urls, params}
              }, 1000)
          }
          return res
      }
      return false
  }*/
}

export default new HTTPFetch();
