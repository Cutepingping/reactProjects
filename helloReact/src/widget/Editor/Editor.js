import React from 'react'
import { get } from 'lodash'
import { Modal, Button, Icon } from 'antd'
import styles from './Editor.less'

// Cookie操作工具
import Cookie from 'js-cookie'
// 上传前获取签名串
import config from '../../config/config'

const { Component } = React

var onmessage = null

export default class extends Component {
  // 构造函数
  constructor(props, context) {
    super(props, context);
    this.state = {
      visible: false,
      frameWidth: 0,
      // frameHeight: 0
    }
  }

  // 打开富文本对话框
  showModal = (e) => {
    let self = this
    self.setState({
      visible: true,
      frameWidth: parseInt(document.body.clientWidth, 10) * 0.8,
      // frameHeight: parseInt(document.body.clientHeight, 10) * 0.61,
    }, () => {
      self.iframeLoad()
    });
  }

  // 点击确定按钮的处理
  handleOk = (e) => {
    // 移除监听事件
    this.handleRemoveEvent()
    // 关闭对话框
    this.setState({
      visible: false
    });
  }

  // 移除监听事件
  handleRemoveEvent(){
    if(typeof window.removeEventListener != 'undefined'){
      window.removeEventListener('message', onmessage)
    }

    if(typeof window.detachEvent != 'undefined'){
      window.detachEvent('message', onmessage)
    }
  }

  // 点击取消按钮的处理
  handleCancel = (e) => {
    // 移除监听事件
    this.handleRemoveEvent()
    // 关闭对话框
    this.setState({
      visible: false,
    });
  }

  // 获取iframe的URL地址
  getIframeUrl(){
    // 获取协议+域名+端口号
    let url = `${config.baseURL}\/huieryun-widgets\/`

    // let url = 'http:\/\/localhost:8008\/'

    let paramsArr = [
      'key=' + (Math.ceil(Math.random() * 1000000000000000)),
      'auth=' + encodeURIComponent(Cookie.get(config.cookie.auth)),
      'policy_url=' + encodeURIComponent(config.getPolicyUrl),
      'group=' + this.props.group,
    ]
    return `${url}#${paramsArr.join('&')}`
  }

  // 默认域尺寸(宽度、高度)
  getSizeObj(){
    let self = this
    let sizeObj = {}

    if(!!self.props.width){
      if(-1 === self.props.width.indexOf('px')){
        sizeObj.width = self.props.width + 'px'
      }else{
        sizeObj.width = self.props.width
      }
    }
    if(!!self.props.height){
      if(-1 === self.props.height.indexOf('px')){
        sizeObj.height = self.props.height + 'px'
      }else{
        let numHeight = self.props.height.replace(/[^\d\.]/g, "")
        let editorHeight = parseInt(numHeight, 10) - 18
        sizeObj.height = self.props.height

        sizeObj.editorHeight = editorHeight + 'px'
      }
    }
    return sizeObj
  }

  // 默认DIV容器尺寸
  getDefaultContainSize(){
    let self = this

    let obj = {}
    let tmpWidth = get(self.getSizeObj(), 'width', null)
    let tmpHeight = get(self.getSizeObj(), 'height', null)

    if(!!tmpHeight){
      obj.width = tmpWidth
    }

    if(!!tmpHeight){
      obj.height = tmpHeight
    }

    return obj
  }

  // 默认文本域尺寸
  getDefaultTextAreaSize(){
    let self = this

    if(!!self.getSizeObj().editorHeight){
      return {
        'height': self.getSizeObj().editorHeight
      }
    }else{
      return {}
    }
  }

  // height={this.state.frameHeight + 'px'}
  //
  // 渲染编辑器内容
  renderBody(){
    return (
      <div>
        <div className={this.state.visible? '' : 'hidden'}>
          <Modal
            title="富文本对话框"
            width={this.state.frameWidth + 'px'}
            visible={this.state.visible}
            onOk={this.handleOk}
            onCancel={this.handleCancel}
            footer={null}
            bodyStyle={{'paddingBottom': '0px', 'paddingTop': '0px'}}
          >
            <iframe ref={'kind_editor_iframe_inst'} src={this.getIframeUrl()} width="100%" frameBorder="no"></iframe>
          </Modal>
        </div>
        <div className={this.state.visible? 'hidden' : ''} style={ this.getDefaultContainSize() } title='点击弹出编辑'>
          <div className={styles.editIconWrap}>
            <Icon type="edit" size="large" onClick={ e => this.showModal(e)} className={styles.editIcon}/>
          </div>
          <div dangerouslySetInnerHTML={{__html: this.props.html || '' }} onClick={ e => this.showModal(e)}  className={styles.editor} style={ this.getDefaultTextAreaSize() }/>
        </div>
      </div>
    )
  }

  // 初始状态或状态变化会触发render
  render(ReactElement, DOMElement, callback) {
    return this.renderBody()
  }
  //准备：即将被重新渲染，状态未变化
  componentWillUpdate(nextProps, nextState) {}

  //完成：正在被重新渲染，状态已变化
  componentDidUpdate(prevProps, prevState) {}

  // 已加载组件，收到新属性时调用
  componentWillReceiveProps(nextProps) {
    let self = this
  }

  // iframe加载触发
  iframeLoad(currId){
    let self = this
    let iframe = self.refs['kind_editor_iframe_inst']

    if(!!iframe){
      // iframe.height = 0
      // iframe.height = self.state.frameHeight

      // 监听子页面发来数据
      onmessage = function (event) {
        var data = event.data;
        var origin = event.origin;

        if(!!data.eventType){
          if('ok' === '' + data.eventType){
            if(!!self.props.onChange){
              self.props.onChange(data && data.html)
            }
            self.handleOk()
          }else if('cancel' === '' + data.eventType){
            self.handleCancel()
          }else if('scrollHeight' === '' + data.eventType){
            iframe.height = parseInt(data.scrollHeight, 10)
          }
        }
      }

      // 先移除注册
      self.handleRemoveEvent()
      // 注册message事件
      if (typeof window.addEventListener != 'undefined') {
        window.addEventListener('message', onmessage, false)
      } else if (typeof window.attachEvent != 'undefined') {
        //for ie
        window.detachEvent('onmessage', onmessage)
      }

      // 待发送的消息
      let msgData = { 'html': self.props.html }
      // 子域
      let childOrigin = '*'
      if (iframe.attachEvent){

        iframe.attachEvent("onload", function(){
          // console.log("Local iframe is now loaded1.")
          iframe.contentWindow.postMessage(msgData, '*')
        })

        //防止二次加载的时候没有更新的情况
        setTimeout(() => {
          iframe.contentWindow.postMessage(msgData, '*')
        }, 200);

      }else{

        iframe.onload = function(){
          // console.log("Local iframe is now loaded2.");
          iframe.contentWindow.postMessage(msgData, '*')
        }

        //防止二次加载的时候没有更新的情况
        setTimeout(() => {
          iframe.contentWindow.postMessage(msgData, '*')
        }, 200);

      }
    } // end if
  }

  // 插入真实 DOM
  componentDidMount() {
    let self = this
  }
}
