/*
 * @Descriptin: 本地sql数据库使用封装
 * @Version: 0.1
 * @Autor: boide gui
 * @Date: 2021-07-27 11:08:10
 * @LastEditors: boide gui
 * @LastEditTime: 2021-07-27 18:16:15
 */
const open = function (name) {
  return (new Promise((resolve, reject) => {
    //判断是否打开
    var isOpen = plus.sqlite.isOpenDatabase({
      name: name,
      path: '_doc/' + name + '.db'
    })
    if (!isOpen) {
      plus.sqlite.openDatabase({
        name: name,
        path: '_doc/' + name + '.db',
        success: function (e) {
          console.log('openDatabase success!')
          resolve(name)
        },
        fail: function (e) {
          console.log('openDatabase failed: ' + JSON.stringify(e))
          reject(e)
        }
      })
    } else {
      resolve(name)
    }
  }))
}


const execute = function (name, sql) {
  return open(name).then(res => {
    return (new Promise((resolve, reject) => {
      plus.sqlite.executeSql({
        name: name,
        sql: sql,
        success: function (e) {
          //查询是否缓存
          resolve('success')
        },
        fail: function (e) {
          console.log('executeSql failed: ' + JSON.stringify(e))
          reject(e)
        }
      })
    }))
  })

}

const select = function (name, sql, type) {
  return open(name).then(res => {
    return (new Promise((resolve, reject) => {
      plus.sqlite.selectSql({
        name: name,
        sql: sql,
        success: function (data) {
          if (data.length > 0) {
            if (type == 'find') {
              resolve(data[0])
            } else {
              resolve(data)
            }
          } else {
            resolve(false)
          }
        },
        fail: function (e) {
          console.log('selectSql failed: ' + JSON.stringify(e))
          reject(e)
        }
      })
    }))
  })
}

module.exports = {
  open,
  execute,
  select
}
