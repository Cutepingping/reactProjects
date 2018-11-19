import { request, config } from '../../../utils'
const { requestApiUrl } = config

// 销毁用户令牌 - 退出登录
export async function delCacheUser (params) {
  return request({
    url: requestApiUrl.delCacheUser,
    method: 'POST',
    data: params,
  })
}