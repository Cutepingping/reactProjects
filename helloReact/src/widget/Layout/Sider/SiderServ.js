import { request, config } from '../../../utils'
const { requestApiUrl } = config

// 查询登录权限
export function queryAuthPath (params) {
  return request({
    url: requestApiUrl.queryAuthPath,
    method: 'get',
    data: params,
  })
}