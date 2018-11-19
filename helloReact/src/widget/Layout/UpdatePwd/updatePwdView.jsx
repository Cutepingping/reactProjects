import React from 'react'
import { Component } from 'react'
import { Button, Row, Form, Input, Popover, Modal, Col} from 'antd'
import $ from 'jquery'
import { parse } from 'qs'
import cx from 'classnames'
import Cookie from 'js-cookie'
import { isEmpty, get, merge } from 'lodash'
import { config } from '../../../utils'
import styles  from './updatePwdStyle.less'
import { messageInform } from '../../../utils/notification'
import { getPhoneCode, forgetLoginPwd, updateLoginPwd } from './updatePwdServ'

const FormItem = Form.Item

const formItemLayout = {
  labelCol: {
    span: 8
  },
  wrapperCol: {
    span: 16
  }
}

class updatePwdView extends Component {
  constructor(props, context) {
    super(props, context)
    this.state = {
      loginInfo: {
        // 手机号码
        phone: '',
        // 手机验证码
        verifyCode: '',
        // 密码
        password: '',
        // 重复密码
        confimpassword: '',
      },
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
  componentWillReceiveProps(nextProps) {}

  // 已插入真实DOM
  componentDidMount() {}

  //组件将被卸载
  componentWillUnmount(){}

  // 输入框改变
  onPwdChange(data) {
    let { loginInfo } = this.state
    let newObj = merge(loginInfo, data)
    this.setState({
      loginInfo: newObj
    })
  }

  // 密码一致性校验
  checkConfirm = (rule, value, callback)=> {
    if (value && (this.state.loginInfo.password !== value)) {
      callback('两次输入不一致！')
    }
    callback()
  }

  // 提交重置密码
  onSubmit(e){
    e.preventDefault()
    e.stopPropagation()
    let self = this
    self.props.form.validateFields((err) => {
      if(_.isEmpty(err)) {
        self.handleModifyPwd()
      }
    })
  }

  // 处理修改密码结果
  handlePwdRes(result){
    if ('0' === '' + result.resultCode) {
      messageInform('设置成功', 'success')
    }
    return false
  }

  // 重置密码请求
  async resetPwdReq(loginInfo){
    // 结果集
    let result = null
    try{
      result = await forgetLoginPwd(loginInfo)
      this.handlePwdRes(result)
    }catch(e){
      messageInform(e || '未知的重置密码异常', 'error')
    }
    return false
  }

  // 修改密码请求
  async updatePwdReq(loginInfo){

    if(!Cookie.get(config.cookie.auth)){
      messageInform('修改密码需要先登录', 'error')
      return false
    }

    // 结果集
    let result = null
    try{
      result = await updateLoginPwd(loginInfo)
      this.handlePwdRes(result)
    }catch(e){
      messageInform(e || '未知的修改密码异常', 'error')
    }
    return false
  }

  // 修改/重置密码处理
  handleModifyPwd(){
    let { loginInfo } = this.state
    let titleName = this.props.titleName

    // 重置密码
    if('重置密码' === '' + titleName){
      this.resetPwdReq(loginInfo)
    // 修改密码
    }else if('修改密码' === '' + titleName){
      this.updatePwdReq(loginInfo)
    }
  }

  // 表单清空
  reset(){
    this.props.form.resetFields()
    this.setState({
      loginInfo: {
        phone:'',
        verifyCode:'',
        password: '',
        confimpassword: ''
      }
    })
  }

  // 取消
  cancel() {}

  // 请求短信验证码
  async reqGetCode(phone){
    try{
      let params = parse({ mobile: phone ,templateCode: 'DEALER_FIND_PASSWORD'})
      // 请求短信验证码
      let result = await getPhoneCode(params)

      if('0' === '' + result.resultCode){
        messageInform('发送验证码成功')
      }else{
        messageInform(result.resultMsg || '未知的发送短信验证码错误', 'error')
      }
    }catch(e){
      messageInform(e || '未知的发送短信验证码异常', 'error')
    }
  }

  // 短信验证码处理
  handleMsgCode(e) {
    // 登录表单信息
    let { loginInfo }  = this.state

    // 手机号
    let phone = get(loginInfo, 'phone', null)
    // 手机号正则
    let reg = /^1[3,4,5,7,8]\d{9}$/

    // 校验非空
    if(!phone){
      messageInform('手机号不能为空', 'error')
      return false
    // 校验格式
    }else if(!reg.test(loginInfo.phone)){
      messageInform('手机号格式不正确', 'error')
      return false
    }

    // 手机号校验通过，开始发送短信
    this.reqGetCode(phone)

    // 倒计时处理
    let count = 60, countDown = null

    setTimeout( e => {
      // 清空，避免请求次数多时，时间变快
      clearInterval(countDown)

      countDown = setInterval(() => {
        if(!count){
          $('#getCode').html("获取验证码")
          $('#getCode').removeAttr('disabled')
          clearInterval(countDown)
        }else{
          $('#getCode').html(count + 's')
          $('#getCode').attr('disabled', true)
          count --
        }
      }, 1000) // end countDown
    }, 1000) // end setTimeout
  } // end handleMsgCode


  getFooter(){
    let footer = [
      <Button key="submit" type="primary" className={cx(styles.btnl, 'mg3r', 'width100')} onClick={ e => this.onSubmit(e)}>提交</Button>,
      <Button key="reset" className={cx('mg1l', 'width100')} onClick={ e => this.reset(e) }>重置</Button>
    ]
    return footer
  }

  // 初始状态或状态变化会触发render
  render(ReactElement, DOMElement, callback) {
    console.log('update pwd render')
    const {getFieldDecorator} = this.props.form

    return (
      <Modal
        title={ this.props.titleName}
        wrapClassName="vertical-center-modal"
        visible={ this.props.visible }
        onCancel={ e => this.props.onClose(e) }
        className={cx('center')}
        footer={ this.getFooter() }
      >
        <div className={cx('iblock', styles.login_info_content)}>
          <Form>
            <FormItem {...formItemLayout} label="手机号码" hasFeedback>
              {
                getFieldDecorator('phone', {
                  rules: [
                    {required: true, message: '请输入您的手机号码!', },
                    {pattern: /^1[3,4,5,7,8]\d{9}$/, message: '手机格式不正确'}
                  ],
                  initialValue: this.state.loginInfo.phone
                })(<Input onBlur={(e) => { this.onPwdChange({phone: e.target.value}) }} />)
              }
            </FormItem>

            <FormItem {...formItemLayout} label="验证码">
              <Row gutter={8}>
                <Col span={12}>
                  {
                    getFieldDecorator('captcha', {
                      rules: [
                        { required: true, message: '请输入您的验证码!' }
                      ],
                    })(<Input size="large" onBlur={(e) => { this.onPwdChange({verifyCode: e.target.value} )}}/>)
                  }
                </Col>
                <Col span={12}>
                    <button className={styles.updatePwd1} onClick={(e) => this.handleMsgCode(e)} id="getCode" dangerouslySetInnerHTML={{__html: "获取验证码"}}></button>
                </Col>
              </Row>
            </FormItem>

            <FormItem {...formItemLayout} label="新密码" hasFeedback>
              {
                getFieldDecorator('password', {
                  rules: [
                    { required: true, message: '请输入您的新密码!',},
                    { pattern: /^[\w_]{6,18}$/ , message: '密码必须为6-18位数字、字母或下划线_组成',}
                  ],
                  initialValue: this.state.password,
                })(<Input type="password" onBlur={(e) => { this.onPwdChange({ password: e.target.value})} } />)
              }
            </FormItem>

            <FormItem {...formItemLayout} label="确认密码" hasFeedback>
              {
                getFieldDecorator('confirmedPwd', {
                  rules: [
                    { required: true, message: '重新输入密码!', },
                    { validator: this.checkConfirm }
                  ],
                  initialValue: this.state.confimpassword
                })(<Input type="password" onBlur={(e) => { this.onPwdChange({confimpassword: e.target.value}) }} />)
              }
            </FormItem>
          </Form>
        </div>
      </Modal>
    )
  }
}

export default (Form.create())(updatePwdView)
