import { get } from 'lodash'
// 站点配置
import config from '../config/config'
 // 路由对象
import { hashHistory } from 'dva/router'

// 自定义跳转
const customLoginRedirect = function(){
  // 自定义跳转登录地址
  let redirectLoginUrl = get(config, 'redirectLoginUrl', '')

  if(config.isB2bLogin) {
    // 若已配置登录地址，则跳转
    if(!!redirectLoginUrl){
      window.location.href = redirectLoginUrl;
    }else{
      // 跳转到登录页
      hashHistory.push('/login')
      window.location.reload();
    }
  } else {
    hashHistory.push('/login')
    window.location.reload();
  }
}

export default { customLoginRedirect }