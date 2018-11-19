import {isEmpty, sortBy, difference, compact, cloneDeep, isArray} from 'lodash'
import menuConfig from '../config/menu'
import {getGlobalData, getLocalData} from './globalScope'
import {browserHistory, hashHistory} from 'dva/router'
import Cookie from 'js-cookie'
import md5 from 'js-md5'
import QRCode from 'qrcode'
import JsBarcode from 'jsbarcode'

//获取url的参数
export function getParams(url = '') {
  let urlSplit = url.split('?'),
    args = {}; // 保存参数数据的对象
  if (isEmpty(urlSplit) || urlSplit.length === 1) {
    return args;
  }
  // 获取url中"?"符后的字串
  let qs = urlSplit[1].replace(/#\/$/, ''),
    items = qs.length ? qs.split("&") : [], // 取得每一个参数项,
    item = null,
    len = items.length;

  for (let i = 0; i < len; i++) {
    item = items[i].split("=");
    let name = decodeURIComponent(item[0]),
      value = decodeURIComponent(item[1]);
    if (name) {
      args[name] = value;
    }
  }
  return args;
}

//获取url的参数值
export function getParamValues(url = '') {
  let urlSplit = url.split('?'),
    args = []; // 保存参数数据的对象
  if (isEmpty(urlSplit) || urlSplit.length === 1) {
    return args;
  }
  // 获取url中"?"符后的字串
  let qs = urlSplit[1].replace(/#\/$/, ''),

    items = qs.length ? qs.split("&") : [], // 取得每一个参数项,
    item = null,
    len = items.length;

  for (let i = 0; i < len; i++) {
    item = items[i].split("=");
    let value = decodeURIComponent(item[1]);
    args.push(value)
  }
  return args;
}

//不同权限角色登录的默认页
export function setPathname(permissions) {
  function findKey(value) {
    const key = difference(sortList, list).find(item => {
      return item.startsWith(value)
    })
    list.push(key);
    if (key) {
      findKey(key);
    }
  }

  let list = [], pathname = '/', obj;
  const sortList = sortBy(permissions);
  list.push(sortList[0]);
  findKey(sortList[0]);
  list = compact(list);
  for (let i = 0; i < list.length; i++) {
    if (i === 0) {
      obj = menuConfig.find(item => item.value === list[i]);
      pathname = `${pathname}${obj.key}`;
    } else if (!isEmpty(obj.child)) {
      obj = obj.child.find(item => item.value === list[i]);
      pathname = `${pathname}/${obj.key}`;
    }
  }
  return pathname;
}

//校验直接输入的地址是否超出权限
export function checkAuth() {
  let path = null, obj = {}, result = '';
  let allAuthPaths = getGlobalData('authPaths');
  let dataSourceId = getGlobalData('dataSourceId');
  let authPaths = allAuthPaths ? allAuthPaths[dataSourceId] : []

  if (ENV === 'development') {
    path = location.pathname;
  } else {
    path = location.hash.slice(2, location.hash.indexOf('?'));
  }
  path = compact(path.split('/'));
  for (let i = 0; i < path.length; i++) {
    if (i === 0) {
      obj = menuConfig.find(item => item.key === path[i]);
      result = authPaths.find(item => item === obj.value);
    } else if (obj && !isEmpty(obj.child)) {
      obj = obj.child.find(item => item.key === path[i]);
      result = authPaths.find(item => item === obj.value);
    }
    if (isEmpty(result)) {
      if (ENV === 'development') {
        browserHistory.push('/');
      } else {
        hashHistory.push('/');
      }
    }
  }
}

//清除所有cookie
export function clearAllCookie() {
  let cookies = Cookie.get();
  Object.keys(cookies).forEach((key) => Cookie.remove(key));
}

//生成uuid
export function generateUuid() {
  var s = [];
  var hexDigits = "0123456789abcdef";
  for (var i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = "-";

  var uuid = s.join("");
  return uuid;
}

//加密
export function encrypt(str) {
  //固定加密串
  let pwd = 'oottbb';
  if (pwd == null || pwd.length <= 0) {
    return null;
  }
  var prand = "";
  for (var i = 0; i < pwd.length; i++) {
    prand += pwd.charCodeAt(i).toString();
  }
  var sPos = Math.floor(prand.length / 5);
  var mult = parseInt(prand.charAt(sPos) + prand.charAt(sPos * 2) + prand.charAt(sPos * 3) + prand.charAt(sPos * 4) + prand.charAt(sPos * 5));
  var incr = Math.ceil(pwd.length / 2);
  var modu = Math.pow(2, 31) - 1;
  if (mult < 2) {
    return null;
  }
  var salt = Math.round(Math.random() * 1000000000) % 100000000;
  prand += salt;
  while (prand.length > 10) {
    prand = (parseInt(prand.substring(0, 10)) + parseInt(prand.substring(10, prand.length))).toString();
  }
  prand = (mult * prand + incr) % modu;
  var enc_chr = "";
  var enc_str = "";
  for (var i = 0; i < str.length; i++) {
    enc_chr = parseInt(str.charCodeAt(i) ^ Math.floor((prand / modu) * 255));
    if (enc_chr < 16) {
      enc_str += "0" + enc_chr.toString(16);
    } else enc_str += enc_chr.toString(16);
    prand = (mult * prand + incr) % modu;
  }
  salt = salt.toString(16);
  while (salt.length < 8)salt = "0" + salt;
  enc_str += salt;
  return enc_str;
}
//解密
export function decrypt(str) {
  //固定加密串
  let pwd = 'oottbb';
  if (str == null || str.length < 8) {
    return '';
  }
  if (pwd == null || pwd.length <= 0) {
    return '';
  }
  var prand = "";
  for (var i = 0; i < pwd.length; i++) {
    prand += pwd.charCodeAt(i).toString();
  }
  var sPos = Math.floor(prand.length / 5);
  var mult = parseInt(prand.charAt(sPos) + prand.charAt(sPos * 2) + prand.charAt(sPos * 3) + prand.charAt(sPos * 4) + prand.charAt(sPos * 5));
  var incr = Math.round(pwd.length / 2);
  var modu = Math.pow(2, 31) - 1;
  var salt = parseInt(str.substring(str.length - 8, str.length), 16);
  str = str.substring(0, str.length - 8);
  prand += salt;
  while (prand.length > 10) {
    prand = (parseInt(prand.substring(0, 10)) + parseInt(prand.substring(10, prand.length))).toString();
  }
  prand = (mult * prand + incr) % modu;
  var enc_chr = "";
  var enc_str = "";
  for (var i = 0; i < str.length; i += 2) {
    enc_chr = parseInt(parseInt(str.substring(i, i + 2), 16) ^ Math.floor((prand / modu) * 255));
    enc_str += String.fromCharCode(enc_chr);
    prand = (mult * prand + incr) % modu;
  }
  return enc_str;
}


//将[{id: myid, name: myname, pId: mypid }] 转为树形结构 [{id: myid, name: myname, children: [] }]
export function convertToTree(data, parentKey, firstLevelId = '0') {
  // 删除 所有 children,以防止多次调用
  data.forEach(item => {
    delete item.children;
  });
  // 将数据存储为 以Id为 KEY 的 map 索引数据列
  let map = {};
  data.forEach(item => {
    map[item.id] = item;
  });
  let list = [], result = [];
  data.forEach(item => {
    // 以当前遍历项的parentCategoryId,去map对象中找到索引的id
    let parent = map[item[parentKey]];
    // 如果找到索引，那么说明此项不在顶级当中,那么需要把此项添加到，他对应的父级中
    if (parent) {
      (parent.children || (parent.children = [])).push(item);
    } else {
      //如果没有在map中找到对应的索引ID,那么直接把 当前的item添加到list中，作为顶级
      list.push(item);
    }
  });
  list.forEach(item => (item[parentKey] === firstLevelId || item[parentKey] === null) && result.push(item))
  return result;
}

//将[{id: myid, name: myname, pId: mypid }] 转为树形结构 [{value: myid, label: myname, children: [] }]
export function convertToCascader(data, parentKey, firstLevelId = '0') {
  // 删除 所有 children,以防止多次调用
  data.forEach(item => {
    item.value = item.id;
    item.name = item.name;
    delete item.children;
  });
  // 将数据存储为 以Id为 KEY 的 map 索引数据列
  let map = {};
  data.forEach(item => {
    map[item.id] = item;
  });
  let list = [], result = [];
  data.forEach(item => {
    // 以当前遍历项的parentCategoryId,去map对象中找到索引的id
    let parent = map[item[parentKey]];
    // 如果找到索引，那么说明此项不在顶级当中,那么需要把此项添加到，他对应的父级中
    if (parent) {
      (parent.children || (parent.children = [])).push(item);
    } else {
      //如果没有在map中找到对应的索引ID,那么直接把 当前的item添加到list中，作为顶级
      list.push(item);
    }
  });
  list.forEach(item => (item[parentKey] === firstLevelId || item[parentKey] === null) && result.push(item))
  return result;
}

//生成条形码
export function generateBarcode(str) {
  let barcode = document.createElement('img'),
    options = {
      fontSize: 18,
      height: 100,
      displayValue: true
    };
  JsBarcode(barcode, str, options);
  return barcode.src
}
//生成二维码
export function generateQRCode(str) {
  let result = ''
  QRCode.toDataURL(str, {errorCorrectionLevel: 'H'}, function (err, url) {
    result = url;
  })
  return result
}

//使用存储在本地的pagesize
export function updatePageSize(path, state) {
  const storedPageSize = getLocalData(path);
  storedPageSize && (state.pageConfig.pageSize = storedPageSize)

  return state
}

//树结构数据转换
export function treeDataConvertor(tree, fieldName) {
  function convert(data) {
    isArray(data) && (data = data.map((item) => {
      item = {
        ...item[fieldName],
        ...item
      }
      delete item[fieldName]
      item.children = convert(item.children);
      return item;
    }));
    return data
  }
  let copyTree = cloneDeep(tree);
  copyTree = convert(copyTree);
  return copyTree;
}
