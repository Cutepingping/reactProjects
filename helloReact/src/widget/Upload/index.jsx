// 加载React
import React from 'react'
// 加载Component
import { Component } from 'react'
// 引入jquery
import $ from 'jquery'
// 引入Cookie
import Cookie from 'js-cookie'
// 引入antd的组件
import { message, Popconfirm, Button, Icon, Upload, Modal } from 'antd'
// 工具方法库
import { merge, has, get, find, findIndex, includes, remove } from 'lodash'

// 加载样式
import styles from './index.less'
// 引入网站配置
import config  from  '../../config/config'
// 引入上传计算文件名方法
import { calculate_object_name } from '../../utils/upload'
// 提醒组件
import { messageInform, reqInform } from '../../utils/notification'
// 样式管理
import cx from 'classnames'

// 导出组件
export default class extends Component {
  // 构造函数
  constructor(props, context) {
    super(props, context)
    let fileList = this.initFileList(props)

    this.state = {
      // 默认上传组件参数
      uploadOptions: {
        className: styles.avatarUploader,
        accept: '.jpg,.png',
        name: "file",
        showUploadList: false,
      },
      // 上传到阿里云OSS参数
      uploadObj: {
        host: '',
        params: {
          OSSAccessKeyId: '',
          policy: '',
          signature: '',
          file: '',
          key: '',
          success_action_status: ''
        }
      },
      // 上传的图片
      pictureSrc: '',
      // 图片尺寸
      imgUrlSize: '',
      // 预览窗口是否可见
      previewVisible: false,
      // 预览的图片地址
      previewImage: '',
      // 预览的图片列表
      fileList
    }
  }

  //准备：即将被重新渲染，状态未变化
  componentWillMount() {
  }

  //准备：即将被重新渲染，状态未变化
  componentWillUpdate(nextProps, nextState) {}

  //完成：正在被重新渲染，状态已变化
  componentDidUpdate(prevProps, prevState) {}

  // 已加载组件，收到新属性时调用
  componentWillReceiveProps(nextProps) {
    this.initOnePic(nextProps)
    let fileList = this.initFileList(nextProps);
    this.setState({fileList});
  }

  // 已插入真实DOM
  componentDidMount() {
    this.initOnePic(this.props)
  }

  //组件将被卸载
  componentWillUnmount(){
    //重写组件的setState方法，直接返回空
    this.setState = (state, callback)=>{
      return;
    };
  }

  // 更新签名到状态机
  updateSign(payload) {
    let self = this, { signObj, file } = payload, uploadObj = {}, isReal = self.props.isReal || false
    // OSS上传对象
    uploadObj = {
      host: signObj.host,
      params: {
        OSSAccessKeyId: signObj.accessid,
        policy: signObj.policy,
        signature: signObj.signature,
        key: calculate_object_name(signObj.dir, this.props.ossFolderName || 'home', file.name, isReal),
        name: file.name,
        success_action_status: '200'
      }
    }
    return new Promise((resolve, reject) => {
      // 设置到状态机之后，执行回调函数
      this.setState({ uploadObj }, () => {
        resolve(true)
      })
    })
  }

  // 获取签名串
  getSign(file){
    let self = this
    return new Promise((resolve, reject) => {
      $.ajax({
        url: config.requestApiUrl.getPolicyUrl,
        type: "GET",
        headers: {
          auth: Cookie.get(config.cookie.auth)
        },
        success: (res) => {
          // 更新OSS上传地址等到状态机
          self.updateSign({ signObj: res.data, file }).then((updateFlag) => {
            resolve(updateFlag)
          }).catch((error) => {
            reject(error)
          })
        },
        error: (err) => {
          reqInform({
            title: '系统提示',
            description: '获取oss签名失败'
          }, 'error')
          reject(err)
        }
      });
    })
  }

  // 截取文件后缀
  getFileSubbfix(fileName){
    let fileSubffix = fileName.substring(fileName.lastIndexOf('.'), fileName.length)
    fileSubffix = fileSubffix.toLowerCase()
    return fileSubffix
  }

  // 是否图片
  isImage(fileName){
    let subffixArr = ['.jpeg', '.jpg', '.png', '.gif', 'bmp'], fileSubffix = '', isImg = false

    fileSubffix = this.getFileSubbfix(fileName)
    isImg = includes(subffixArr, fileSubffix)

    if(!isImg){
      message.error('你只能上传jpg、jpeg、png、gif、bmp格式的文件!')
      return false
    }
    return isImg
  }

  // 是否文本文件
  isTextFile(fileName){
    let subffixArr = ['.doc', '.docx', '.pdf', '.xlsx', '.xls', '.txt', '.rar', '.zip', '.7z'], fileSubffix = '', isText = false

    fileSubffix = this.getFileSubbfix(fileName)
    isText = includes(subffixArr, fileSubffix)

    if(!isText){
      message.error('你只能上传doc、docx、pdf、xlsx、xls、txt、rar、zip、7z格式的文件!')
      return false
    }
    return isText
  }

  // 校验文件类型
  checkFileType(file){
    // 用户自定义文件类型
    let customType = get(this.props, 'fileType', null)
    // 用户设置了fileType属性
    switch(customType){
      case 'image':
        return this.isImage(file.name)
        break
      case 'file':
        return this.isTextFile(file.name)
      default:
        return true
    }
  }

  // 校验文件大小
  checkFileSize(file){
    // 用户自定义了大小
    let fileMaxSize = get(this.props, 'fileMaxSize')
    // 若用户设置了fileMaxSie属性
    if(!!fileMaxSize){
      let sizeLimit = file.size / 1024 / 1024 < fileMaxSize
      if (!sizeLimit) {
        message.warn(`图片必须小于${fileMaxSize}MB!`)
        return false
      }
    }
    return true
  }

  //上传数据判断
  async beforeUpload(file){
    // 校验文件类型
    let fileTypeFlag = this.checkFileType(file)
    // 校验文件大小
    let fileSizeFlag = this.checkFileSize(file)

    // 同步请求签名串
    let isSign = await this.getSign(file);

    if(fileTypeFlag &&  fileSizeFlag && isSign){
      return Promise.resolve(true)
    }else{
      return Promise.reject(false)
    }
  }

  // 删除图片
  removePicture(e){
    let self = this, oldPictureSrc = get(self.state, 'pictureSrc', '')
    this.setState({ pictureSrc: '' }, () => {
      if(!!self.props.removeFileCbf){
        self.props.removeFileCbf(oldPictureSrc)
      }
    })
  }

  // 初始化文件列表
  initFileList(props){
    let uploadedUrls = get(props, 'uploadedUrls', null)
    // 空值判断
    if(!uploadedUrls || 0 === uploadedUrls.length) return []
    if('[object String]' === '' + Object.prototype.toString.call(uploadedUrls)){
      uploadedUrls = [uploadedUrls]
    }
    let tmpUrls = []

    // 构造预览列表
    uploadedUrls.map((data, index) => {
      tmpUrls.push({
        uid: index,
        status: 'done',
        url: data,
      })
    })
    return tmpUrls
  }

  // 获取保存的状态
  getStateObj(file, fileList, imgUrl){
    // 展示形式 1 单个图片预览
    let showType = get(this.props, 'showType', '1')
    // 保存的状态
    let stateObj = { pictureSrc: imgUrl }
    // 文件对象
    let currFile = find(fileList, d => file.uid === d.uid )
    currFile.url = imgUrl

    // 照片墙
    if('3'=== '' + showType){
      stateObj = { fileList }
    }

    return stateObj
  }

  // 获取上传文件名
  getFileName(){
    let fileUrl = this.state.uploadObj.host + '/' + this.state.uploadObj.params.key
    return fileUrl
  }

  // 上传成功回调
  onChange({file, fileList}) {

    let self = this, imgUrl = self.getFileName(), removeFileCbf = get(this.props, 'removeFileCbf', null)

    // 上传完成
    if (file.status === 'done') {
      let stateObj = self.getStateObj(file, fileList, imgUrl)
      // 设置到状态机
      self.setState(stateObj, () => {
        // 执行传入的回调函数
        let uploadSuccessCbf = get(self.props, 'uploadSuccessCbf', null)
        if(!!uploadSuccessCbf){
          let newImgUrl = imgUrl + (this.state.imgUrlSize? this.state.imgUrlSize: '')
          uploadSuccessCbf(newImgUrl)
        }
        // 成功提示语
        message.success(`${file.name} 文件上传成功`);
      })

    }

    // 上传错误
    else if (file.status === 'error') {
      let index = findIndex(this.state.fileList, d => d.uid === file.uid)
      fileList.splice(index, 1)
      this.setState({fileList})
      message.error(`${file.name} 文件上传失败.`);
    }

    // 上传中，更新文件列表
    else if (file.status === 'uploading') {
      self.setState({ fileList })
    }

    // 删除照片墙
    else if (file.status === 'removed') {
      let index = findIndex(this.state.fileList, d => d.uid === file.uid)
      this.setState({fileList})
      if(!!removeFileCbf){
        removeFileCbf(index)
      }
    }
  }

  // 初始化图片
  initOnePic(props){
    let uploadedUrls = get(props, 'uploadedUrls', null), showType = get(props, 'showType', '1'), pictureSrc = ''

    if(includes(['1', '2'], '' + showType)){
      if('[object Array]' === '' + Object.prototype.toString.call(uploadedUrls)){
        pictureSrc = get(uploadedUrls, '[0]', '')

      }else if('[object String]' === '' + Object.prototype.toString.call(uploadedUrls)){
        pictureSrc = uploadedUrls
      }
    }
    // 设置显示尺寸
    let imgUrlSize = get(props, 'imgUrlSize', '')
    this.setState({ pictureSrc, imgUrlSize })
  }

  // 上传组件属性
  showUpload(){
    // 合并自定义属性到默认参数
    let uploadProps = merge(this.state.uploadOptions, this.props)

    // 用户未自定义beforeUpload事件，则使用组件默认方法
    if(!has(uploadProps, 'beforeUpload')){
      // 改变beforeUpload中this的作用域为当前组件
      uploadProps.beforeUpload = this.beforeUpload.bind(this)
    }

    // 用户未定义onChange方法时，则使用组件默认方法
    if(!has(uploadProps, 'onChange')){
      uploadProps.onChange = this.onChange.bind(this)
    }

    // 用户自定义acceptType
    let acceptType =  get(this.props, 'acceptType', null)
    if(!!acceptType){
      uploadProps.accept = acceptType
    }

    // 用户自定义accept
    let accept = get(this.props, 'accept', null)
    if(!!accept){
      uploadProps.accept = accept
    }

    // 附加action和data
    uploadProps.action = get(this.state, 'uploadObj.host', '')
    uploadProps.data = get(this.state, 'uploadObj.params', {})

    // 照片墙
    let showType = get(this.props, 'showType', '1')
    if('3' === '' + showType){
      uploadProps.className = ''
      uploadProps.listType = 'picture-card'
      uploadProps.onPreview= this.handlePreview
      uploadProps.showUploadList =  true
    }else if('1' === '' + showType){
      uploadProps.className = ''
    }

    return uploadProps
  }

  // 上传提示
  getUploadTip(){
    let uploadTip = get(this.props, 'uploadTip', '')

    // 默认图片提示
    if(!uploadTip){
      return <p> 支持扩展名：.png  .jpg... </p>
    }else{
      let uploadTipType = Object.prototype.toString.call(uploadTip)

      // 支持字符串的提示语
      if('[object String]' === '' + uploadTipType){
        return <p> { uploadTip } </p>

      // 执行自定义函数的提示语
      }else if('[object Function]' === '' + uploadTipType){
        return uploadTip()

      }else{
        console.warn('不支持的提示类型')
      }
    }
  }

  // 预览点击取消
  handleCancel = () => {
    this.setState({ previewVisible: false })
  }

  // 点击预览
  handlePreview = (file) => {
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true
    })
  }

  // 预览上传按钮
  getPreUploadBtn(fileList){
    let maxFiles = get(this.props, 'maxFiles', 1)
    let fileLen = get(fileList, 'length', 0)

    if(fileLen >= maxFiles){
      return null
    }else{
      return (
        <div className="text-info">
          <i className="iconfont icon-upload"/>
          <div className="ant-upload-text" style={{marginTop: '-2px'}}>上传图片</div>
        </div>
      )
    }
  }

  // 初始状态或状态变化会触发render
  render(ReactElement, DOMElement, callback) {
    let showType = get(this.props, 'showType', '1')
    let fileList = []

    if(0 === this.state.fileList.length){
      fileList = this.initFileList(this.props)
    }else{
      fileList = this.state.fileList
    }
    return (
      <div>
        {
          '1' === '' + showType && (
            <div>
              {
                <p className={ styles.modalP + " " + (this.props.imgClassName?  this.props.imgClassName : "uploadImg") } >
                {
                  this.state.pictureSrc ? <Popconfirm
                    title='确定要删除该图片吗?'
                    okText='确定'
                    cancelText='取消'
                    onConfirm={ (e) => this.removePicture(e) }
                  >
                    <Icon type="close-circle"/>
                  </Popconfirm> : ''
                }
                <img src={ this.state.pictureSrc ? this.state.pictureSrc + (this.state.imgUrlSize? this.state.imgUrlSize : config.imgSize) : config.uploadImgdefault } alt="" className={styles.logoImg}/>
                </p>
              }
              <div className={ styles.modalUpBtn }>
                <Upload { ...this.showUpload() }>
                  <Button>
                    <Icon type="upload" />上传文件
                  </Button>
                </Upload>
                {/*
                  提示语
                */}
                { this.getUploadTip() }
              </div>
            </div>
          )
        }

        {
          '2' === '' + showType && (
            <div className={ styles.customAvatar }>
              {
                this.state.pictureSrc ? <p className={ styles.closeBtn }>
                  <Popconfirm
                      title='确定要删除该图片吗?'
                      okText='确定'
                      cancelText='取消'
                      onConfirm={ (e) => this.removePicture(e) }
                    >
                    <Icon type="close-circle" className={styles.anticonCloseCircle}/>
                  </Popconfirm>
                </p>: null
              }
              <Upload
                { ...this.showUpload() }
              >
                {
                  this.state.pictureSrc ?
                  <img src={this.state.pictureSrc} alt="" className={styles.avatar} /> :
                  <Icon type="plus" className={styles.avatarUploaderTrigger} />
                }
              </Upload>
            </div>
          )
        }

        {
          '3' === '' + showType && (
            <div className="clearfix" style={{textAlign: 'left'}}>
              <Upload
                fileList={ fileList }
                { ...this.showUpload() }
              >
                { this.getPreUploadBtn( fileList ) }
              </Upload>
              <Modal visible={this.state.previewVisible} footer={null} onCancel={this.handleCancel}>
                <img alt='' style={{ width: '100%' }} src={this.state.previewImage} />
              </Modal>
            </div>
          )
        }

      </div>
    )
  }
}
