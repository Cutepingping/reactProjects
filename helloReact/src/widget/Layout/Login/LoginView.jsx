import React from 'react'
import { Component } from 'react'
import { hashHistory } from 'dva/router'
import { parse } from 'qs'
import cx from 'classnames'
import Cookie from 'js-cookie'
import { Button, Row, Form, Input, Popover, Modal, Col, Spin } from 'antd'

import bodyClass  from '../bodyClass'
import { config} from '../../../utils'
import { rstr2b64 } from '../../../utils/md5'
import { messageInform } from '../../../utils/notification'
import styles from './LoginStyle.less'

import { queryValidateImg, reqLogin, queryUserDetail } from './LoginServ'
import {get} from 'lodash'
import UpdatePwd from '../UpdatePwd/updatePwdView'
import logoImg from '../../../assets/img/logo.png'

const FormItem = Form.Item
const formItemLayout = {
  labelCol: {
    span: 0
  },
  wrapperCol: {
    span: 24
  },
}

class loginView extends Component {
  constructor(props, context) {
    super(props, context)
    this.state = {
      uniqueId: '',
      //登录验证码
      validateImgUrl: '',
      loginButtonLoading: false,
      updatePwdFlag: false,
    }
  }

  //准备：即将被重新渲染，状态未变化
  componentWillMount() {}
  //准备：即将被重新渲染，状态未变化
  componentWillUpdate(nextProps, nextState) {}
  //完成：正在被重新渲染，状态已变化
  componentDidUpdate(prevProps, prevState) {}
  // 已加载组件，收到新属性时调用
  componentWillReceiveProps(nextProps) {}
  // 已插入真实DOM
  componentDidMount() {
    let self = this
    // 给文档body加样式
    bodyClass()
    // 请求图形验证码
    self.getValidateImg()
    // 监听键盘敲击事件
    self.regKeyDown()
  }

  //组件将被卸载
  componentWillUnmount(){
    //重写组件的setState方法，直接返回空
    this.setState = (state, callback)=>{
      return
    }
  }

  // 登录按钮点击
  handleOk(e) {
    this.props.form.validateFieldsAndScroll((errors, values) => {
      if (errors) {
        return
      }
      this.doLogin(values)
    })
  }

  // 设置登录按钮的loading
  setButtonLoading(flag){
    // 设置按钮加载中
    this.setState({
      loginButtonLoading: flag
    })
  }

  // 存储登录结果到Cookie
  saveResToCookie(data){
    Object.keys(data).forEach((key) => {
      Cookie.set(key, data[key], { expires: config.loginTimeout })
    })
  }

  // 执行登录处理
  async doLogin(payload){
    let self = this
    let { password, validateCode, username } = payload
    let loginParam = {
      //用户名
      userCode: username,
      //密码MD5加密
      userPassword: rstr2b64(password),
      //企业中心开发过程需要使用经销商门户的登录
      loginType: 'name',
      //1:pc ,2 :经销商门户
      loginSource: config.sysType === 'entCenter' ? 2 : 1,
      trench: 'pc',
      verifyCode: validateCode,
      uniqueId: self.state.uniqueId,
    }

    // 登录加载中
    self.setButtonLoading(true)

    try{
      // 登录结果 - 调用登录接口
      let resp = await reqLogin(parse(loginParam))
      if ('0' === '' + resp.resultCode){
        // 存储登录结果到Cookie
        self.saveResToCookie({
          [config.cookie.userName]: username,
          [config.cookie.auth]: resp.data.auth
        });

        // 指定了登录之后跳转
        if(!!config.isRedirect){
          hashHistory.push(config.homePath)
        // 默认跳转到首页
        }else{
          hashHistory.push('/')
        }
      }else{
        self.getValidateImg()
      }
    }catch(e){
      messageInform(e || '未知的登录异常', 'error')
      self.getValidateImg()
    }
    // 关闭登录加载中
    self.setButtonLoading(false)
  }

  // 注册键盘监听事件
  regKeyDown(){
    document.onkeydown = (e) => {
      let self = this
      // 兼容FF和IE和Opera
      var theEvent = e || window.event
      // 键盘的二进制编码
      var code = theEvent.keyCode || theEvent.which || theEvent.charCode
      // 13 回车键
      if (code == 13) {
        self.handleOk(e)
      }
    }
  }
  // 请求验证码
  async getValidateImg(){
    let self = this
    let time = Math.random()
    let result = await queryValidateImg({ time })

    if('0' === '' + result.resultCode){
      self.setState({
        validateImgUrl: ('data:image/jpeg;base64,' + result.data.image),
        uniqueId: result.data.uniqueId
      })
    }
  }

  // 打开密码对话框
  showPwdDlg(e){
    this.setState({
      updatePwdFlag: true
    })
  }

  // 关闭密码对话框
  hidePwdDlg(e){
    this.setState({
      updatePwdFlag: false
    })
  }

  // 初始状态或状态变化会触发render
  render(ReactElement, DOMElement, callback) {
    const { getFieldDecorator } = this.props.form;

    return (
      <div>
        {
          this.state.updatePwdFlag && <UpdatePwd titleName='重置密码' visible={ this.state.updatePwdFlag } onClose={ e => { this.hidePwdDlg(e) } }/>
        }
        <div className={styles.startsContent}>
          <div className={cx(styles.starts)}></div>
        </div>
        <div className={cx(styles.spin)}>
          <Spin tip="加载用户信息..." spinning={false} size="large">
            <div className={styles.bgColor}>
              <div className={styles.contentStyle}>
                <div className={styles.logo}>
                  <img alt={'logo'} src={logoImg}/>
                  <p>{ '欢迎登录' + config.appName }</p>
                </div>
                <div className={styles.form}>
                  <form className="formItemNone">
                    <FormItem {...formItemLayout}  hasFeedback>
                      {
                        getFieldDecorator('username', {
                          rules: [
                            {
                              required: true,
                              message: '请填写用户名',
                            },
                          ],
                      })(<Input size="large" onPressEnter={ e => this.handleOk(e) } placeholder="用户名" prefix={ <i  className="iconfont">&#xe684;</i>}/>)}
                    </FormItem>
                    <FormItem  {...formItemLayout}  hasFeedback>
                      {
                        getFieldDecorator('password', {
                          rules: [
                            {
                              required: true,
                              message: '请填写密码',
                            },
                          ],
                      })(<Input size="large" type="password" onPressEnter={ e => this.handleOk(e) } placeholder="密码" prefix={ <i  className="iconfont">&#xe683;</i>}/>)}
                    </FormItem>
                    <div className={styles.validateCode}>
                      <FormItem  {...formItemLayout}>
                        {
                          getFieldDecorator('validateCode', {
                            rules: [
                              {
                                required: true,
                                message: '请填写验证码',
                              },
                            ],
                        })(<Input size="large" placeholder="验证码" className="width175"/>)}
                        <img className={styles.imgStyle} src={ this.state.validateImgUrl } onClick={ e => this.getValidateImg(e) }/>
                      </FormItem>
                    </div>

                    <Row>
                      <Button className={styles.buttonStyle} type="primary" size="large" onClick={ e => this.handleOk(e) } loading={ this.state.loginButtonLoading }>登录</Button>
                    </Row>
                    <div className={cx('txtright', 'mg2t')}>
                      <a href="javascript:;" onClick={ e => this.showPwdDlg(e) }>忘记密码</a>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </Spin>
        </div>
      </div>
    )
  }
}

export default Form.create()(loginView)
