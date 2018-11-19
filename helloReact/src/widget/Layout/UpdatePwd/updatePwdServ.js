import {config} from '../../../utils'
const {requestApiUrl} = config
import {request} from '../../../config/request'

// 请求短信验证码
export function getPhoneCode (params) {
  return request({
    url: requestApiUrl.phoneCode,
    method: 'GET',
    data: params
  })
}

// 修改密码 - 提交
export function updateLoginPwd (params) {
  return request({
    url: requestApiUrl.updatedPassword,
    method: 'PUT',
    data: params
  })
}

// 重置密码
export function forgetLoginPwd (params) {
  return request({
    url: requestApiUrl.forgetPassword,
    method: 'POST',
    data: params
  })
}
