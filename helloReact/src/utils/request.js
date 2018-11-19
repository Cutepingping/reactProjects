import axios from 'axios'
import qs from 'qs'
import config from '../config/config'
import {reqInform, showConfirm} from './notification'
import Cookie from 'js-cookie'
import {hashHistory} from 'dva/router'
import {join,get} from 'lodash'
import { messageInform } from '../utils/notification'
import {getLocalData} from '../utils/globalScope'
import toBase64 from './toBase64'
// 登录跳转的方法
import { customLoginRedirect } from '../utils/redirect_utils'

// 弹窗次数
let confirmCount = 0

const fetch = (options) => {
  const {method = 'post', data, url, auth = Cookie.get(config.cookie.auth), timeout = config.reqTimeout } = options
  // 取出headers
  let {headers} = options;
  headers = headers ? headers : {}
  //解决ie不重新请求问题
  headers = {
    ...headers,
    'auth': auth,
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Expires': -1
  }

  if (!headers['Content-type']) {
    headers['Content-type'] = 'application/x-www-form-urlencoded';
  }
  const hasUrl = function (arr, url) {
    let flag = false
    arr.map((k, i) => {
      if(url.indexOf(k) !== -1){
        flag = true
      }
    })
    return flag
  }
  const exAuthArr = ['restapi.amap.com', config.requestApiUrl.getValidateImg]
  // 请求headers中移除auth
  if (hasUrl(exAuthArr, url)) {
    delete headers['auth'];
  }

  const exAppIdArr = ['verify/img/get', '/huieryun-identity/', 'restapi.amap.com']

  // 请求headers中增加appId
  if(!hasUrl(exAppIdArr, url)){
    headers["appId"] = config.appId;
  }

  //过滤获取经纬度报错问题
  const exAuthArr1 = ['restapi.amap.com'];
  // 请求headers中移除Pragma  Expires
  if (hasUrl(exAuthArr1, url)) {
    delete headers['Pragma'];
    delete headers['Expires'];
    delete headers['unitId'];
  }

  if(config.mock){
    headers = {}
  }
  // console.log('headers:', headers);
  switch (method.toLowerCase()) {
    case 'get':
      return axios.get(`${url}${options.data ? `?${qs.stringify(options.data)}` : ''}`, {headers, timeout})
    case 'delete':
      return axios.delete(`${url}${options.data ? `?${qs.stringify(options.data)}` : ''}`, {headers, timeout})
    case 'head':
      return axios.head(url, data, {headers, timeout})
    case 'post':
      let newData = data;
      if ('' + headers['Content-type'] === 'application/x-www-form-urlencoded') {
        newData = qs.stringify(data)
      }
      return axios.post(url, newData, {headers, timeout})
    case 'put':
      let putData = data;
      if ('' + headers['Content-type'] === 'application/x-www-form-urlencoded') {
        putData = qs.stringify(data)
      }
      return axios.put(url, putData, {headers, timeout})
    case 'patch':
      return axios.patch(url, data, {headers, timeout})
    default:
      return axios(options)
  }
}

// 跳转到登录
const go2Login = function(isReload){
  confirmCount = 1;
  localStorage.removeItem('antdAdminSiderFold')
  sessionStorage.removeItem('SIDER_OPEN_KEY')
  sessionStorage.removeItem('SIDER_SELECTED_KEY')
  Cookie.remove(config.cookie.userName);
  Cookie.remove(config.cookie.auth);
  //企业中心
  if(config.sysType === 'entCenter') {
    localStorage.removeItem(config.userInfoKey);
  }
  // 自定义登录跳转方法
  customLoginRedirect()

  // if(!!isReload){
  //   window.location.reload();
  // }
}

// 检测登录处理, isReload 未登录是否刷新
const checkLogin = function(isReload){
  let auth = Cookie.get(config.cookie.auth);
  // Cookie中无auth令牌，直接跳转到登录页面
  if(!auth){
    // 跳转登录
    go2Login(isReload)
  }
  return false
}

//isHandCommErr： 是否需要request方法做统一全局报错处理
export default function request (options, isHandCommErr　) {

  if(!options || !options.url){
    reqInform({
      title: '无效的url',
      description: '请求选项中的url是无效的'
    }, 'error')
    return Promise.reject({resultCode: 1, resultMsg: '无效的url：' + options.url, data: null})
  }

  options.url = config.apiAppName(options.url);

  //判断是否存在表情等特殊字符
  if(options.data){
    let emojiData = JSON.stringify(options.data);
    var emojiRegRule = /\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g;
    if (emojiData && emojiData.match(emojiRegRule)) {
      messageInform('参数包含了特殊表情符号或其它不可辨识的符号', 'error');
      return false;
    }
  }

  return fetch(options).then((response) => {
    const {statusText, status} = response
    let data = options.isCross ? response.data.query.results.json : response.data

    // Cookie中有auth令牌，表示已登录，但是auth失效的，则弹出窗口提示
    if ('' + 401 === '' + response.status) {
      // 检测是否登录
      checkLogin(false)
      // 若已登录，则检测auth是否失效
      if(confirmCount < 1 ){
        showConfirm().then((cRes) => {
          if('1' === '' + cRes){
            go2Login(false)
          }else{
            confirmCount = 0
          }
        })
        confirmCount ++
      }
      return {resultCode: 0, resultMsg: '登录信息失效提示', data: null}
    }

    if((response.status !== '401' && isHandCommErr && (response.data.resultCode !== 0))) {
      reqInform({
        title: '系统提示',
        description: response.data.resultMsg || '接口服务故障'
      }, 'warn')
    }

    return {
      resultCode: 0,
      status,
      resultMsg: statusText,
      ...data,
    }
  }).catch((error) => {
    const {response = {statusText: 'Network Error'}} = error
    let errDesc = response.statusText || '接口服务故障';

    // Cookie中有auth令牌，表示已登录，但是auth失效的，则弹出窗口提示 '1' === '' + error.errCode ||
    if ('401' === '' + response.status) {
      // 检测是否登录
      checkLogin(true)
      // 已登录，则检测auth是否失效
      if(confirmCount < 1 ){
        showConfirm().then((cRes) => {
          if('1' === '' + cRes){
            go2Login(true)
          }else{
            confirmCount = 0
          }
        })
        confirmCount ++
      }
      return {resultCode: 0, resultMsg: '登录信息失效提示', data: null}
    } else if('' + 406 === '' + response.status) {
      // 如果服务接口响应406，一般是带有sql注入风险的关键字
      errDesc = '查询内容包含sql注入风险的关键字';
    }

    reqInform({
      title: '出现请求错误',
      description: errDesc
    }, 'error')

    return {resultCode: 1, resultMsg: response.statusText, data: null}
  })
}
