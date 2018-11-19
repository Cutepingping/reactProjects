// 基础的公共配置
let baseConfig = {
  // 环境变量
  ENV: ENV,
  // 系统名字
  appName: '商城管理后台',
  // 底部版权文本
  footerText: '云徙科技 版权所有 © 2018',
  // 是否需要登陆
  isLogin: false,
  // 登录cookie超时 ，单位天
  loginTimeout: 1,
  // 请求超时
  reqTimeout: 15000,
  // 统一表格分页配置1
  largePageSizeList: ['10', '20', '50', '100'],
  // 统一表格分页配置2
  smallPageSizeList: ['10', '20', '50', '100', '200', '500'],
  // 默认路由
  homePath: '/',
  // 登陆之后是否跳转页面，true: 跳转至 配置的homePath; false: 跳转至/
  isRedirect: true,
  // 是否需要切换组织
  isMultiOrg: false,
  //是否需要消息通知
  isMsgNotify: false,
  //cookie key
  cookie: {
    auth: 'auth_shop',
    userName: 'user_shop'
  },
  //是否显示静态菜单
  isStaticMenu: true,
  //是否不显示页签
  noTab: true,
  // 接口主机地址
  baseUrl: '',
  //列表页一些配置
  listConfig: {
    //表格是否添加滚动条td上限
    scrollTd:5,
    //表格滚动配置
    tableScroll: {x: 1200},
    //处理表格是否有滚动条
    tableTdLength:e=>{
      let scroll = {};
      if(e.length > baseConf.listConfig.scrollTd){
        scroll = {x:1200};
      }
      //return scroll;
      return {};
    },
    //处理表格头部信息
    columns:e=>{
      let widthName = {
        //日期
        "time":"150px",
        //手机
        "phone":"115px",
      };
      e.map(item=>{
        //如果是日期，宽度100
        for(let i in widthName){
          if(item["name"] == i){
            item.width = widthName[i];
          }
        };
        if(item["title"] == "序号"){
          item.width = "65px";
        }
      });
      return e;
    },
    //搜索框布局
    searchCol: {
      xs: {span: 24},
      md: {span: 12},
      lg: {span: 8},
      xl: {span: 6}
    },
    searchFormItem: {
      labelCol: {span: 8},
      wrapperCol: {span: 16}
    }
  },
  // 公共的api请求
  requestApiUrl: {
    //获取手机验证码
    phoneCode: `pearlriver-sys-application/api/v1/pearlriver/sms/send`,
    //修改登录密码
    updatedPassword: `pearlriver-sys-application/api/v1/pearlriver/comm/user/password/update`,
    //忘记登录密码
    forgetPassword: `smartsales-sys-application/api/v1/sys/user/password/forget`,
    // 查询角色操作按钮
    queryAuth: `smartsales-sys-application//api/admin/user/getRoleRes`,
    // 查询菜单权限
    queryAuthPath: `pearlriver-sys-application/api/v1/pearlriver/sys/menu/list`,
    // 获取图形验证码
    getValidateImg: `huieryun-identity/api/v1/auth/pearlriver/verify/img/get`,
    //注销
    delCacheUser: `huieryun-identity/api/v1/auth/pearlriver/user/shop-web-pc/logout`,
    //获取组织
    userOrg: `smartsales-sys-application/api/v1/sys/user/unit/list`,
    //组织切换保存
    updateSelCurOrg: `smartsales-sys-application/api/v1/sys/user/change/unitid`,
    //获取用户详情
    getUserDetail: `pearlriver-sys-application/api/v1/pearlriver/user/get/detail`,
    // 上传签名url
    getPolicyUrl: `pearlriver-sys-application/api/v1/huieryun/objectstorage/policy/pearlriver/getpolicy`,
    //登录
    loginUrl: `huieryun-identity/api/v1/auth/pearlriver/user/shop-web-pc/auth`,
    // 上传图片
    uploadUrl: `pearlriver-sys-application/api/v1/huieryun/objectstorage/policy/pearlriver/getpolicy`
  },
  mock: false
}

// 根据不同环境变量，不同的配置
let envConfig = {
  loc: {
    baseUrl: '',
    mock: true
  }
}
// 合并配置
let config = Object.assign(baseConfig, envConfig[baseConfig.ENV])

/**
 * 获得api接口地址
 * @param  {String} url    接口地址
 * @param  {Object} config 基础配置信息
 * @return {String}        转换过的接口地址
 */
const getApiAppName = function(url, app) {
  // 是否本地，且开启mock
  let isMock = config.mock && (config.ENV == 'loc' || config.ENV === 'dev')
  // 地址判空
  if(!url) return false;
  // 若为完整地址，且不是本地mock
  if(url.indexOf("http") >= 0 && isMock) {
    return url
  }
  // 本机开发环境，则当前assets/mock下面的json
  if(isMock){
    return config.baseUrl + "/assets/mock/" + url.replace(/\//g, "-") + '.json'

  // 其它环境，则读取真实应用的接口
  }else{
    let version = 'api/v1'
    let res = `${config.baseUrl}/${version}/${url}`;
    return res;
  }
}

// 拼接接口所需域名和服务名，只需要输入接口名即可  如 yundt/mgmt/item/list-by-page，也不要加斜杆开始，
// 如果接口以http开头，则不会进拼接，而是保留原样
// 如果是mock，则会去assets/mock请求同名json，但/会被替换为-   如  yundt-mgmt-item-list-by-page.js
config.apiAppName = getApiAppName

export default config