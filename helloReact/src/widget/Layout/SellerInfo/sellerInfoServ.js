import { request, config } from '../../../utils'
const { requestApiUrl } = config

// 获取商户信息
export function getSellerInfo (params) {
  // return request({
  //   url: requestApiUrl.getSeller,
  //   method: 'GET',
  //   data: params
  // });

  let data = {
    "resultCode": 0,
    "resultMsg": "success",
    "data": {
      "sellerName": ""
    }
  }
  return Promise.resolve(data)
}