/**
 * @(#)request.js 0.5.1 2017-09-13
 * Copyright (c) 2017, YUNXI. All rights reserved.
 * YUNXI PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 */
import { request as commonRequest } from '../utils'
import config from './config'
import { getLocalData } from '../utils/globalScope'
import Cookie from 'js-cookie'

/*
 * 请求
 *
 * @author 苏离
 * @since 0.5.1
 */
//项目统一处理，例如对不同service使用不同host
export function request(option, autoErrHandleFlag = true) {
  let {url} = option;
  if(url.indexOf("http") >= 0){
    option.url = url;
  } else {
    option.url = config.baseUrl + url;
  }
  option.headers = {
    ...option.headers,
    orgId: getLocalData('currentOrg'),
    unitId: getLocalData('currentUnitId'),
    channelId: Cookie.get(config.cookie.userName + '_channel')
  }

  return commonRequest(option, autoErrHandleFlag)
}
