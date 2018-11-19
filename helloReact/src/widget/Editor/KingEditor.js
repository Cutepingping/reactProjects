/*
 * 富文本（新）
 *
 * @author 乐毅、苏离、战龙
 * @since 2018/06/12
 */

import React from 'react'
import { get } from 'lodash'
import { Modal, Button, Icon } from 'antd'
import styles from './Editor.less'
import $ from 'jquery'
import Cookie from 'js-cookie'
import config from '../../config/config'
import "assets/kindEditor/kindeditor-all"
import "assets/kindEditor/lang/zh-CN.js"
import "assets/kindEditor/qs.min.js"
import "assets/kindEditor/kindeditor-config"

const { Component } = React

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

function calculate_object_name(g_dirname, group, filename) {
  if(!filename){
    return '';
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
function getUploadCfg(policyUrl, auth, file, group){

  return $.ajax({
    url: policyUrl,
    type: "GET",
    headers: { auth: auth }

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
function postObject2OSS(uploadCfg, file){
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
    let tmpKey = ump.key

    if(!!file.client_width || !!file.client_height){
      tmpKey += '?x-oss-process=image/resize'

      if(!!file.client_width){
        tmpKey += `,w_${file.client_width}`
      }

      if(!!file.client_height){
        tmpKey += `,h_${file.client_height}`
      }
    }
    return uploadCfg.uploadImgServer + '/' + tmpKey
  }).fail(function(err) {
    return err
  })
}

// 图片上传前触发
function beforeUpload(file, attachType) {
  var defer= $.Deferred()
  // 限制的大小
  var limitObj = {
    'image/jpeg': 2,
    'video/mp4': 10
  }
  var limitKeys = Object.keys(limitObj)
  // 不支持的格式
  if(-1 === $.inArray('' + file.type, limitKeys)){
    if('image' === '' + attachType){
      defer.reject('你只能上传jpg格式的文件!')
    }else{
      defer.reject('你只能上传mp4格式的文件!')
    }
  }else{
    const isLtSize = file.size / 1024 / 1024 < limitObj['' + file.type]
    if('image/jpeg' === '' + file.type){
      if (!isLtSize) {
        defer.reject(`图片必须小于${ limitObj['' + file.type] }MB!`)
      }else{
        defer.resolve(true)
      }
    }else if('video/mp4' === '' + file.type){
      if (!isLtSize) {
        defer.reject(`mp4必须小于${ limitObj['' + file.type] }MB!`)
      }else{
        defer.resolve(true)
      }
    }
  }
  // console.log('file.type:', file.type, 'file.size:', file.size)

  // const isJPG = file.type === 'image/jpeg'
  // if (!isJPG) {
  //   defer.reject('你只能上传JPG格式的文件!')
  // }
  // const isLt2M = file.size / 1024 / 1024 < 2
  // if (!isLt2M) {
  //   defer.reject('图片必须小与于2MB!')
  // }
  // if(isJPG && isLt2M){
  //   defer.resolve(true)
  // }
  // 返回校验结果
  return defer
}

// 执行上传文件到OSS
function uploadObject2OSS(policyUrl, auth, file, group, attachType){
  return beforeUpload(file, attachType)
    .then((flag) => {
      return getUploadCfg(policyUrl, auth, file, group)
    })
    .then((uploadCfg) => {
      return postObject2OSS(uploadCfg, file)
    })
    .fail((err) => {
      return err
    })
}

export default class extends Component {
  // 构造函数
  constructor(props, context) {
    super(props, context);
    this.editItem = null;
    this.state = {
      visible: false,
      frameWidth: 0,
      // frameHeight: 0
    }
  }
  //准备：即将被重新渲染，状态未变化
  componentWillUpdate(nextProps, nextState) {}

  //完成：正在被重新渲染，状态已变化
  componentDidUpdate(prevProps, prevState) {

  }

  // 已加载组件，收到新属性时调用
  componentWillReceiveProps(nextProps) {
    if(this.editItem && !this.editItem.html() && nextProps.html) {
        this.editItem && this.editItem.html(nextProps.html);
    }
  }

  // 插入真实 DOM
  componentDidMount() {
    this.initEditor(this.props)
  }

  initEditor(props) {
    const policy_url = config.getPolicyUrl;
    const auth = Cookie.get(config.cookie.auth);
    const group = 'group1';
    const key = Math.ceil(Math.random() * 1000000000000000);

    var customConfig = {
      uploadJson: "http:\/\/www.dtyunx.com",
      resizeType: 0,
      allowFileManager: false,
      allowFlashUpload: true,
      allowMediaUpload: true,
      allowFileUpload: false,
      afterChange: ()=>{
          this.editItem && props.inputChange(this.editItem.html());
      },
      items: KIND_EDITOR_ITEMS_CONFIG,
      // 自定义上传
      customUploadImg: (files, insert, attachType)=>{
        let self = this;
        var file = files[0]
        if(!file) return false
        // file 已选择的文件对象
        // home 文件对象的组名(目录)
        uploadObject2OSS(policy_url, auth, file, group, attachType).then((imgUrl) => {
          // 插入编辑器
          insert(imgUrl)
        }).fail((err) => {
          if('401' === '' + err.status){
            alert('登录信息失效，请重新登录')
          }else{
            try{
              if('[object String]' === '' + Object.prototype.toString.call(err)){
                alert(err || '未知的上传图片异常')
                  self.editItem.hideDialog()
              }else{
                let errorObj = JSON.parse(err.responseText)
                alert(errorObj.resultMsg || '未知的上传图片异常')
              }
            }catch(e){
              console.error(e)
              alert(e || '未知的上传图片异常')
                self.editItem.hideDialog()
            }
          }
        })
      },
      afterCreate: function() {
        let that = this
        that.sync();
      },
      beforeSetHtml: function() {
        // console.log('beforeSetHtml')
        let that = this
        that.sync();
      },
      afterSetHtml: function() {
        console.log('afterSetHtml')
        let that = this
        that.sync();
      },
      afterBlur: function() {
        let that = this
        that.sync();
      },
      // afterChange: function () {
      //  let that = this
      //  // that.sync();
      //  // //富文本输入区域的改变事件，一般用来编写统计字数等判断
      //  // console.log("最多20000个字符,已输入" + that.count() + "个字符");
      // },
    }
    this.editItem = KindEditor.create(`#${props.id}`, customConfig)
  }

  // 初始状态或状态变化会触发render
  render() {
    let customStyle = this.props.style || {width: '100%', height: 400}
    return <div>
      <script id={this.props.id} name="myContent" type="text/plain" style={customStyle}>
      </script>
    </div>
  }
}
