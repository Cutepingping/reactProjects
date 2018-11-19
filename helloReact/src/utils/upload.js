// 导入jQuery
import $ from 'jquery'
// Cookie操作工具
import Cookie from 'js-cookie'
// 上传前获取签名串
import config from '../config/config'

function random_string(len) {
　　len = len || 32;
　　var chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
　　var maxPos = chars.length;
　　var pwd = '';
　　for (let i = 0; i < len; i++) {
  　pwd += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return pwd;
}

function get_suffix(filename) {
  let pos = filename.lastIndexOf('.')
  let suffix = ''
  if (pos != -1) {
      suffix = filename.substring(pos)
  }
  return suffix;
}

function calculate_object_name(g_dirname, group, filename, isReal) {
  if(!filename){
    return '';
  }

  if(!!isReal){
    if(!!group){
      return `${g_dirname}group/${filename}`
    }else{
      return `${g_dirname}${filename}`
    }
  }

  let suffix = get_suffix(filename)
  let g_object_name = g_dirname + random_string(10) + suffix
  if(!!group){
    if(g_dirname.indexOf('/') == -1){
      g_dirname += '/'
    }
    g_object_name = decodeURIComponent(g_dirname + group + '/' + random_string(10) + suffix)
  }
  return g_object_name;
}

// 获取OSS上传配置
function getUploadCfg(file, group){

  return $.ajax({
    url: config.getPolicyUrl,
    type: "GET",
    headers: { auth: Cookie.get(config.cookie.auth) }

  }).then((res) => {
    let uploadCfg = {}

    uploadCfg.uploadImgServer = res.data.host
    uploadCfg.uploadImgParams = {
      OSSAccessKeyId: res.data.accessid,
      policy: res.data.policy,
      signature: res.data.signature,
      key: calculate_object_name(res.data.dir, group || 'home', file && file.name),
      name: file && file.name,
      size: file && file.size,
      success_action_status: '200'
    }
    uploadCfg.file = file

    return uploadCfg

  }).fail((err) => {
    return err
  })
}

// 上传对象到OSS
function postObject2OSS(uploadCfg){
  // FormData对象
  let formData = new FormData()

  // 附加参数
  let ump = uploadCfg.uploadImgParams
  Object.keys(ump).map((k, i) => {
    formData.append(k, ump[k])
  })
  formData.append('file', uploadCfg.file)

  // 上传文件
  return $.ajax({
    url: uploadCfg.uploadImgServer,
    type: 'POST',
    cache: false,
    data: formData,
    processData: false,
    contentType: false
  }).then(function(res) {
    return uploadCfg.uploadImgServer + '/' + ump.key
  }).fail(function(err) {
    return err
  })
}

// 图片上传前触发
function beforeUpload(file) {
  var defer= $.Deferred()

  const isJPG = file.type === 'image/jpeg'
  if (!isJPG) {
    defer.reject('你只能上传JPG格式的文件!')
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    defer.reject('图片必须小于2MB!')
  }
  if(isJPG && isLt2M){
    defer.resolve(true)
  }
  // 返回校验结果
  return defer
}

// 执行上传文件到OSS
function uploadObject2OSS(file, group){
  return beforeUpload(file)
  .then((flag) => {
    return getUploadCfg(file, group)
  })
  .then((uploadCfg) => {
    return postObject2OSS(uploadCfg)
  })
  .fail((err) => {
    return err
  })
}

export default {calculate_object_name, uploadObject2OSS}
