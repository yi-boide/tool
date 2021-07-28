/**
 * 通用uni-app网络请求
 * 基于 Promise 对象实现更简单的 request 使用方式，支持请求和响应拦截
 */
let interceptor = {
	request: null,
	response: null
};
let config = {
	// baseUrl: 'https://hp.juwantech.cn',
	baseUrl: 'http://192.168.0.157:9000',
	header: {
		'Content-Type':'application/json;charset=UTF-8',
		'Content-Type':'application/x-www-form-urlencoded'
	},  
	data: {},
	method: 'GET',
	dataType: 'json', /* 如设为json，会对返回的数据做一次 JSON.parse */
	responseType: 'text',
	success() {},
	fail() {},
	complete() {}
};
export default {
	toast(msg, callback) {
		uni.showToast({
			title: msg,
			icon: 'none',
			duration: 2000,
			success() {
				callback &&
				setTimeout(() => {
					callback();
				}, 1500);
			}
		});
	},
	request(options) {
		if (!options) {
			options = {};
		}
		options.baseUrl = options.baseUrl || config.baseUrl;
		options.dataType = options.dataType || config.dataType;
		const isHttp = /^(http|https):\/\//.test(options.url);
		options.url = isHttp ? options.url : options.baseUrl + options.url;
		options.data = options.data || {};
		options.method = options.method || config.method;
		//TODO 数据签名
		// let _token = {'Authorization': uni.getStorageSync('token') ? 'Bearer ' + uni.getStorageSync('token') : ''};
		
		// 写死的token 测试使用,后期替换 
		let _token = {'Authorization': 'eyJhbGciOiJIUzUxMiJ9.eyJjbGFpbV9rZXlfdXNlcl90eXBlIjoyLCJjbGFpbV9rZXlfdG9rZW4iOiJmZjViZWY3NC0zNDE1LTQ5OTctYThlNy1lZDJmYWNjM2Y5YTYifQ.d2J6zdKR5M0ZMvInhM2YPVTJ4cinlBGfkfIPiac4yORCCQN7DbWm1RFxIz6FtuflLR0PRUt2UZ2Tm9Ow9LyiKA'};
		
		options.header = Object.assign({}, options.header, _token);
	   
		return new Promise((resolve, reject) => {
			let _config = null;
			
			options.complete = (response) => {
				let statusCode = response.statusCode;
				response.config = _config;
				if (interceptor.response) {
					let newResponse = interceptor.response(response);
					if (newResponse) {
						response = newResponse;
					}
				}
				if (statusCode === 200) { //成功
					let res = response.data;
					this.filterResult(res, options, resolve, reject);
				} else {
					reject(response);
				}
			};

			_config = Object.assign({}, config, options);
			_config.requestId = new Date().getTime();

			if (interceptor.request) {
				interceptor.request(_config);
			}
			
			uni.request(_config);
		});
	},
	get(url, data, options) {
		if (!options) {
			options = {};
		}
		options.url = url;
		options.data = data;
		options.method = 'GET';  
		
		return this.request(options);
	},
	post(url, data, options) {
		if (!options) {
			options = {};
		}
		options.url = url;
		options.data = data;
		options.method = 'POST';
		return this.request(options);
	},
	put(url, data, options) {
		if (!options) {
			options = {};
		}
		options.url = url;
		options.data = data;
		options.method = 'PUT';
		return this.request(options);
	},
	delete(url, data, options) {
		if (!options) {
			options = {};
		}
		options.url = url;
		options.data = data;
		options.method = 'DELETE';
		return this.request(options);
	},
	/*
	 * 请求结果统一处理 
	 * @param {object} res 接口返回后的数据信息
	 * @param {object} options 额外参数配置
	 * @param {resolve} resolve Promise.resolve()
	 * @param {reject} reject Promise.reject()
	 * @param {return}  返回成功后的参数
	 */
	filterResult(res, options, resolve, reject) {
		switch (parseInt(res.code)) {
			case 0:
			case 200:
				resolve(options.hasOwnProperty('all') ? res : res.data);
				break;
			case 1101:
				uni.removeStorageSync('token');
				uni.reLaunch({
					url: '/pages/login/login'
				});
				this.toast(res.msg);
				reject(res);
				break;
			case 1000:
				this.toast(res.msg);
				reject(res);
				break;
			default:
				this.toast(res.msg);
				reject(res);
				break;
		}
	},
	/*
	 * 上传到服务器 
	 * @param {string} url 接口请求地址
	 * @param {object} data json数据参数
	 * @param {object} params params数据参数
	 * @param {object} options 额外参数配置
	 * @param {return}  返回成功后的参数
	 */
	async postJson(url, data, params, options = {}) {
		if (params && Object.keys(params).length) {
			url += '?';
			const text = [];
			Object.keys(params).map((p, index) => {
				if (params[p] != undefined) {
					text.push(`${index ? '&' : ''}${p}=${params[p]}`);
				}
			});
			url += text.join('');
		}
		return await this.post(url, data, options);
	},
	/* 
	 * 上传到服务器 
	 * @param {string} url 接口请求地址
	 * @param {filePath} data 上传的文件
	 * @param {object} options 额外参数配置
	 * @param {return}  返回成功后的参数
	 */
	async upload(url, data, options = {}) {
		// 判断链接是否http或者https开头
		const isHttp = /^(http|https):\/\//.test(url);
		let _token = {'Authorization': uni.getStorageSync('token') ? 'Bearer ' + uni.getStorageSync('token') : ''};
		return await new Promise((resolve, reject)=>{
			uni.uploadFile({
				url: isHttp ? url : config.baseUrl + url,
				filePath: data,
				name: 'file',
				header:_token || {},
				success: res => {
					// 转换成json
					res.data = JSON.parse(res.data);
					this.filterResult(res.data, options, resolve, reject);
				},
				fail: err => {
					reject(err);
				}
			});		
		});
	},
	/*
	 * 选择图片，并且上传
	 * @param {string} url 接口请求地址
	 * @param {object} options 额外参数配置
	 * @param {return}  返回成功后的参数
	 */
	async uploadImg(url, options = {}) {
		return await new Promise((resolve, reject) => {
			uni.chooseImage({
				count: 1,
				sourceType: ['album', 'camera'],
				sizeType: ['compressed'],
				success: async res => {
					try{
						resolve(await this.upload(url, res.tempFilePaths[0], options));
					}catch(e){
						reject(err);
					}
				}
			});
		});
	},
	/*
	 * 选择文件，并且上传
	 * @param {string} url 接口请求地址
	 * @param {object} options 额外参数配置
	 * @param {return}  返回成功后的参数
	 */
	async uploadFile(url, options = {}) {
		return await new Promise((resolve, reject) => {
			uni.chooseFile({
				count: 1,
				extension: ['.doc', '.docx', '.jpg', '.png', '.pdf'],
				sizeType: ['compressed'],
				success: async res => {
					try{
						resolve(await this.upload(url, res.tempFilePaths[0], options));
					}catch(e){
						reject(err);
					}
				}
			});
		});
	},
};
