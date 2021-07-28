<!--
 * @Descriptin: 蓝牙通信使用文档
 * @Version: 0.1
 * @Autor: boide gui
 * @Date: 2021-07-02 14:33:23
 * @LastEditors: boide gui
 * @LastEditTime: 2021-07-28 18:35:22
-->
# 蓝牙通信使用文档

### main.js文件中引入插件
> xxxxxxxxxxxx代表各自的服务id，特征值
```
import Bluetooth from './plugins/Bluetooth/index.js';
const bluetooth = new Bluetooth({
	serviceId: 'xxxxxxxxxxxx',
	redCharacter: 'xxxxxxxxxxxx',
	writeCharacter: 'xxxxxxxxxxxx',
	timeout: 40000
});
Vue.prototype.$bluetooth = bluetooth;
```

### 搜索蓝牙设备
```
// 搜索设备
async toBluetoothSearch() {
  try{
    const device = await this.$bluetooth.searchForBluetoothDevices()
    // 调用连接设备/重连设备方法
    await this.connect(device)
  }catch(e){
    console.log(e)
  }
}
```

### 连接设备/重连设备
```
// 连接设备/重连设备 device入参无值代表重新连接设备，没有刷新页面的情况下，若是刷新了页面那么重连服务就没有了
async connect(device) {
  if (device) this.deviceName = device.name;
  try{
    // 连接中提示框
    uni.showLoading({ title: 'Connecting', mask: true })
    // 连接蓝牙设备
    const server = await this.$bluetooth.createBLEConnection(device)
    // 获取蓝牙设备的服务
    const service = await this.$bluetooth.connectBLEConnectionService(server)
    // 初始化蓝牙发送服务
    await this.$bluetooth.initWriteBLECharacteristic(service)
    // 监听蓝牙回调服务 this.analysis为蓝牙监听回调的方法
    await this.$bluetooth.notifyBLECharacteristicValue(service, this.analysis)
    // 清除提示框
    uni.hideLoading()
    return this.globalData.deviceName
  }catch(e){
    console.log(e)
    // 清除提示框
    uni.hideLoading()
    return 0
  }
}
```

### 回调方法
> 传入蓝牙回调通知的16进制数据的数组，在本方法中进行数据解析，格式如下
> [44,53,23,15,13,03]
```
analysis(hexArr) {
  const TYPE = hexArr.slice(0, 3).join('')
  switch (TYPE) {
    // 比如这个特征值代表的是蓝牙发送的某个操作
    case '550a80':
      break;
    case '550605':
      break;
    default:
      break;
  }
}
```