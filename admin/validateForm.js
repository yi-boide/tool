/*
 * @Descriptin:
 * @Version: 0.1
 * @Autor: boide gui
 * @Date: 2020-12-15 11:12:02
 * @LastEditors: boide gui
 * @LastEditTime: 2021-06-23 17:40:02
 */
// 引入正则验证函数
import {
  validPhone,
  validEmail,
  validPassword,
  validLength
} from './validate'

/**
 * 统一公用模块
 * @param {Object} validity - 入参对象
 * @param {boolean=} validity.required - 是否必选
 * @param {string=} validity.trigger - 触发方式
 * @param {string=} validity.message - 描述
 * @returns {Object}
 */
export function unifyValidity({ required = true, trigger = 'change', message = '必选项不能为空' }) {
  return {
    required,
    message,
    trigger
  }
}

/**
 * 手机号效验
 * @returns {Object}
 */
export function validPhoneFn() {
  return {
    required: true,
    validator: (rule, value, callback) => {
      if (!validPhone(value)) {
        callback(`手机号码格式错误`)
      }
      callback()
    },
    trigger: ['change', 'blur']
  }
}

/**
 * 密码校验
 * @returns {Object}
 */
export function validPasswordFn() {
  return {
    required: true,
    validator: (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入密码'))
      } else if (validPassword(value)) {
        callback(new Error('密码长度为6 - 18个字符'))
      }
      callback()
    },
    trigger: ['change', 'blur']
  }
}

/**
 * 邮箱效验
 * @returns {Object}
 */
export function validEmailFn() {
  return {
    required: true,
    validator: (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入邮箱'))
      } else if (!validEmail(value)) {
        callback(new Error('请输入正确的邮件格式'))
      }
      callback()
    },
    trigger: ['change', 'blur']
  }
}

/**
 * 字符字数效验
 * @param {number} length
 * @returns {Object}
 */
export function validLengthFn(length) {
  return {
    validator: (rule, value, callback) => {
      if (validLength(value, length)) {
        callback(`长度不能超过${length}个字符`)
      }
      callback()
    },
    trigger: ['change', 'blur']
  }
}
