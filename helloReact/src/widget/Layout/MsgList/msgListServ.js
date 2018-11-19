import { request, config } from '../../../utils'
const { requestApiUrl } = config

// 我的消息列表
export function myList(params) {
  return request({
    url: requestApiUrl.mymessageList,
    method: 'GET',
    data: params
  })

  // let data = {
  //   "data": {
  //     "total": 1,
  //     "pages": 1,
  //     "pageSize": 5,
  //     "list": [
  //       {
  //         "subject": "大甩卖活动",
  //         "id": 64400,
  //         "time": "2017-11-17 16:29:28",
  //         "title": "shoudaolema",
  //         "content": "范德萨范德萨范德萨范德萨风格的腾飞的回复对光反射V型从富士达富士达"
  //       }
  //     ],
  //     "pageNum": 1
  //   },
  //   "resultCode": 0,
  //   "resultMsg": "success"
  // }
  // return Promise.resolve(data)
}
