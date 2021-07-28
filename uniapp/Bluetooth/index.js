/**
 * H5 Web Bluetooth API蓝牙通信
 * Web Bluetooth API 文档地址：https://developer.mozilla.org/zh-CN/docs/Web/API/Bluetooth
 * @param {Object} props - 入参
 * @param {string} props.serviceId - 设备服务id
 * @param {string} props.redCharacter - 读取设备信息的特征值
 * @param {string} props.writeCharacter - 发送设备信息的特征值
 * @param {number} props.timeout - 连接设备超时时间（ms）
 */
export default class Bluetooth {
	constructor(props) {
		// 设备服务id
		this.serviceId = props.serviceId;
		// 读取设备信息的特征值
		this.redCharacter = props.redCharacter;
		// 发送设备信息的特征值
		this.writeCharacter = props.writeCharacter;
		// 设备连接超时时间
		this.timeout = props.timeout;
		// 判断是否已经存在了监听设备断开的事件
		this.notify2 = false;
		// 通知监听
		this.notifyInfo = false;
		// 设备服务
		this.device = null;
		// 通信服务1
		this.server = null;
		// 通信服务
		this.service = null;
		// 发送
		this.characteristicWrite = null;
		// 升级
		this.upgradeNotify = false;
		// upgrade升级的状态
		this.upgrade = false;
	}
	/**
	 * 搜索蓝牙设备
	 * @returns {Promise} device - device
	 */
	searchForBluetoothDevices() {
		return new Promise((resolve, reject) => {
			// 调用Web Bluetooth API蓝牙模块
			window.navigator.bluetooth.requestDevice({
				filters: [{
					namePrefix: 'V'
				}],
				optionalServices: [
					'D973F2E0-B19E-11E2-9E96-0800200C9A66'.toLowerCase(),
					'8A97F7C0-8506-11E3-BAA7-0800200C9A66'.toLowerCase()
				]
			}).then(async device => {
				// 处理不同浏览器中获取设备名称的方式不同
				if (device.deviceName) {
					device.name = device.deviceName;
				}
				resolve(device);
			});
		});
	}
	/**
	 * 连接蓝牙设备
	 * @param {Object} device - device
	 * @returns {Promise} server - server
	 */
	async createBLEConnection(device) {
		if (!device) {
			device = this.device;
		}
		// 连接设备
		try {
			// 连接设备时判断是否刚刚已经连接的设备，若不是则清除之前设备的蓝牙断开回调，并且断开设备的连接
			await this.closeBLEConnection(device);
      let num = 0;
      // 该定时器为了防止设备关机状态下，重新连接时，一直处在loading状态的问题
      // this.timeout毫秒若是连接不上，提示反馈信息
      let numInterval = setInterval(() => {
        num += 1;
        if (num >= this.timeout/1000) {
          clearInterval(numInterval);
					uni.hideLoading();
					uni.showToast({
						title: 'Connection timeout, please make sure the device is turned on.',
						icon: 'none',
						duration: 2000
					});
        }
      }, 1000);
			// 监听蓝牙断开的事件
			if (!this.notify2) {
				device.addEventListener('gattserverdisconnected', this.disconnectHandler);
				this.notify2 = true;
			}
			device.upgrade = this.upgrade;
			this.device = device;
			const server = await device.gatt.connect();
			this.server = server;
			clearInterval(numInterval);
			return server;
		} catch (err) {
			return Promise.reject(err);
		}
	}
	/**
	 * 连接设备服务
	 * @param {Object} server - server
	 * @returns {Promise} service - 返回设备服务
	 */
	async connectBLEConnectionService(server) {
		try {
			const service = await server.getPrimaryService(this.serviceId.toLowerCase());
			this.service = service;
			return service;
		} catch (e) {
			return Promise.reject(service);
		}
	}
	/**
	 * 断开设备连接
	 * @param {Object} device - device
	 */
	async closeBLEConnection(device) {
		if (this.device && this.device.name !== device.name) {
			try {
				this.device.removeEventListener('gattserverdisconnected', this.disconnectHandler);
				await this.device.gatt.disconnect();
				this.notify2 = false;
			} catch (error) {
				return Promise.reject(error);
			}
		}
	}
	/**
	 * 蓝牙断开回调
	 */
	disconnectHandler() {
		if (this.upgrade) {
			uni.showToast({
				title: 'Upgrade successful.',
				none: 'none',
				duration: 2000
			});
			setTimeout(res => {
				this.device.upgrade = this.upgrade;
				this.upgrade = false;
			}, 1000);
			setTimeout(res => {
				history.go(0);
			}, 2000);
			return;
		}
		uni.reLaunch({
			url: '/pages/index/connect?close=true'
		});
	}
	/**
	 * 蓝牙通知回调
	 * @param {Object} service - 蓝牙设备通信服务
	 * @callback requestCallback
	 * @param {Array} callback(hexArr) - 回调函数返回值
	 * @returns {Object} notifyInfo - 获取设备返回的信息的函数
	 */
	async notifyBLECharacteristicValue(service, callback) {
		let string = [];
		this.notifyInfo = await service.getCharacteristic(this.redCharacter.toLowerCase());
		this.notifyInfo.addEventListener(
			'characteristicvaluechanged', e => {
				let hexArr = Array.prototype.map.call(new Uint8Array(e.target.value.buffer),
					bit => ('00' + bit.toString(16)).slice(-2));
				let hexArr_slice = hexArr.slice(0, 3).join('');
				if (hexArr_slice === '550401' || hexArr_slice === '550608' ||
					hexArr_slice === '550602') {
					string = hexArr;
					return false;
				} else {
					if (string.length > 0) {
						hexArr = string.concat(hexArr);
						string = [];
					}
					callback(hexArr);
				}
			}
		);
		this.notifyInfo.startNotifications();
		return this.notifyInfo;
	}
	/**
	 * 初始化蓝牙发送服务
	 * @param {Object} service - 蓝牙设备通信服务
	 * @returns {Promise} BluetoothRemoteGATTCharacteristic - A Promise to an instance of BluetoothRemoteGATTCharacteristic
	 */
	async initWriteBLECharacteristic(service) {
		try {
			const characteristicWrite = await service.getCharacteristic(this.writeCharacter.toLowerCase());
			this.characteristicWrite = characteristicWrite;
			return characteristicWrite;
		} catch (e) {
			return Promise.reject(e);
		}
	}
	/**
	 * 发送蓝牙指令
	 * @param {ArrayBuffer} buffer - ArrayBuffer
	 * @returns {Promise} Promise - 成功通知
	 */
	async writeBLECharacteristicValue(buffer) {
		try {
			if (!this.characteristicWrite) return;
			return await this.characteristicWrite.writeValue(buffer);
		} catch (e) {
			return Promise.reject(e);
		}
	}
	/**
	 * 获取蓝牙设备版本号
	 * @param {Object} server - server
	 * @returns {Object} version - 成功通知
	 * @returns {area=} version.area - 版本，欧版，美版
	 * @returns {version=} version.version - 版本号
	 */
	async getVersion(server) {
		var service = await server.getPrimaryService('8A97F7C0-8506-11E3-BAA7-0800200C9A66'.toLowerCase());
		var characteristic = await service.getCharacteristic('210F99F0-8508-11E3-BAA7-0800200C9A66'.toLowerCase());
		try {
			return await characteristic.readValue().then(async res => {
				var hexArr = Array.prototype.map.call(
					new Uint8Array(res.buffer),
					function(bit) {
						return ('00' + bit.toString(16)).slice(-2);
					}
				);
				let area = hexArr[5];
				let version = parseInt(hexArr[6], 16) + '.' + parseInt(hexArr[7], 16) + '.' + parseInt(
					hexArr[8], 16);
				return { area, version };
			});
		} catch (e) {
			return Promise.reject(e);
		}
	}
	/** 
	 * 进行蓝牙ota升级
	 * @param {Object} app - getApp()实例
	 */
	async otaBLEUpgrade(app) {
		uni.showLoading({ title: 'Firmware upgrading now, please wait.', mask: true });
		const PrefixZero = (num, n) => {
			return (Array(n).join(0) + num).slice(-n);
		};
		const getUpgradeInit = (fileSize, hexArr) => {
			const buffer = new ArrayBuffer(9);
			const dataView = new DataView(buffer);
			dataView.setUint8(0, '0x08');
			// 文件大小
			dataView.setUint8(1, '0x' + fileSize.slice(6, 8));
			dataView.setUint8(2, '0x' + fileSize.slice(4, 6));
			dataView.setUint8(3, '0x' + fileSize.slice(2, 4));
			dataView.setUint8(4, '0x' + fileSize.slice(0, 2));
			// 告诉文件位置
			dataView.setUint8(5, '0x' + hexArr[3]);
			dataView.setUint8(6, '0x' + hexArr[2]);
			dataView.setUint8(7, '0x' + hexArr[1]);
			dataView.setUint8(8, '0x' + hexArr[0]);
			return dataView;
		};
		// 发送蓝牙升级指令
		const otaBLESend = async () => {
			try{
				const checkSum = (message, start, destPos) => {
					var checksum = 0;
					for (var i = start; i < destPos; i++) {
						checksum ^= parseInt(message[i], 16);
					}
					return checksum.toString(16);
				};
				const sleep = (time) => {
					return new Promise((resolve) => {
						setTimeout(() => {
							resolve();
						}, 100 * time);
					});
				};
				const getUpgradeData = (arr) => {
					const buffer = new ArrayBuffer(arr.length);
					const dataView = new DataView(buffer);
					for (var i = 0, len = arr.length; i < len; i++) {
						dataView.setUint8(i, '0x' + arr[i]);
					}
					return buffer;
				};
				var SeqNum = this.SeqNum;
				var fw_image_packet_size = 208;
				for (var a = SeqNum, lens = SeqNum + 8; a < lens; a++) {
					// checksum
					var arr = ['7a'];
					// 208有效值
					for (var i = 0, len = fw_image_packet_size; i < len; i++) {
						// eslint-disable-next-line eqeqeq
						if (this.contents[i + a * fw_image_packet_size] == undefined) {
							uni.hideLoading();
						}
						arr.push(this.contents[i + a * fw_image_packet_size]);
					}
					// ask
					var ask = '00';
					if (a === (lens - 1)) {
						ask = '01';
					}
					arr.push(ask);
					var value = SeqNum.toString(16);
					for (let i = 0, len = (4 - value.length); i < len; i++) {
						value = '0' + value;
					}
					arr.push(value.substr(2, 2));
					arr.push(value.substr(0, 2));
					arr[0] = checkSum(arr, 1, arr.length);
					SeqNum++;
					await sleep(1);
					await this.characteristic2.writeValue(getUpgradeData(arr));
				}
			}catch(e){
				return Promise.reject(e);
			}
		};
		try{
			let service = await this.server.getPrimaryService('8A97F7C0-8506-11E3-BAA7-0800200C9A66'.toLowerCase());
			this.upgrade = true;
			this.device.upgrade = this.upgrade;
      let characteristic = await service.getCharacteristic('210F99F0-8508-11E3-BAA7-0800200C9A66'.toLowerCase());
      // 读取设备升级位置  A,B
      let characteristic1 = await service.getCharacteristic('122e8cc0-8508-11E3-BAA7-0800200C9A66'.toLowerCase());
			// 读取设备升级位置  A,B
			var hexArr = await characteristic1.readValue().then(res => {
				return Array.prototype.map.call(
					new Uint8Array(res.buffer),
					function(bit) {
						return ('00' + bit.toString(16)).slice(-2);
					}
				);
			});
			var { contents, fileSize } = await app.post('/pc/file', { area: app.globalData.area, 'hexArr': hexArr }, 1);
			this.fileSize = fileSize;
			var oldFileSize = fileSize;
			oldFileSize = oldFileSize.toString(16);
			oldFileSize = PrefixZero(oldFileSize, 8);
			// 告诉固件文件大小，还有就是升级A区还是B区
			this.contents = contents;
			await characteristic.writeValue(getUpgradeInit(oldFileSize, hexArr));
			// 开始监听
			if (this.upgradeNotify === false) {
				this.upgradeNotify = await service.getCharacteristic('2bdc5760-8508-11e3-baa7-0800200c9a66'.toLowerCase());
				await this.upgradeNotify.addEventListener(
					'characteristicvaluechanged', async e => {
						var hexArr = Array.prototype.map.call(
							new Uint8Array(e.target.value.buffer),
							function(bit) {
								return ('00' + bit.toString(16)).slice(-2);
							}
						);
						this.SeqNum = parseInt(hexArr.reverse().join(''), 16);
						// 开始写入数据
						this.characteristic2 = await service.getCharacteristic('2691aa80-8508-11e3-baa7-0800200c9a66'.toLowerCase());
						await otaBLESend();
					}
				);
				this.upgradeNotify.startNotifications();
			}
		}catch(e){
			console.log(e);
			uni.hideLoading();
			return Promise.reject(e);
		}
	}
}
