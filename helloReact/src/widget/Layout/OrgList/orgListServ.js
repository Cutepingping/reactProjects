import { request, config } from '../../../utils'
const { requestApiUrl } = config

// 获取用户组织机构
export async function getUserOrg (params) {
  return request({
    url: requestApiUrl.userOrg,
    method: 'get',
    data: params,
  })

  // let data = {
  //   "resultCode": 0,
  //   "resultMsg": "success",
  //   "data": [
  //     {
  //       "name": "贵州茅台集团电子商务股份有限公司", 
  //       "id": "1157282239283725312"
  //     }
  //   ]
  // }
  // return Promise.resolve(data)
}