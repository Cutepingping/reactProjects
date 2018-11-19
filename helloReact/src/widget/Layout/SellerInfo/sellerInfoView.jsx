// 加载React
import React from 'react'
// 加载Component
import { Component } from 'react'

// 引入antd的组件
import { Select } from 'antd'
// 样式管理器
import cx from 'classnames'

// 站点配置
import config from '../../../config/config'

import styles from './sellerInfoStyle.less'
import { getSellerInfo } from './sellerInfoServ'

import { setLocalData } from '../../../utils/globalScope'
// 弹出提示框
import { messageInform } from '../../../utils/notification'

// 导出组件
export default class extends Component {
  // 构造函数
  constructor(props, context) {
    super(props, context)
    this.state = {
      sellerInfo: {}
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
    this.getSellerData()
  }

  //组件将被卸载  
  componentWillUnmount(){}

  // 是否触发render函数
  shouldComponentUpdate(nextProps, nextState) {
    return true
  }

  // 获取商户信息
  async getSellerData(){
    try{
      // 查询商户信息 - 若存在
      let result = await getSellerInfo({})

      if ('0' === '' + result.resultCode) {
        this.setState({
          sellerInfo: result.data
        })
      }
    }catch(e){
      messageInform(e || '未知的查询商户信息异常', 'error')
    }
  }

  // 初始状态或状态变化会触发render
  render(ReactElement, DOMElement, callback) {
    return (
      <span className={styles.headInfo}>
        { this.state.sellerInfo && this.state.sellerInfo.sellerName }
      </span>
    )
  }
}