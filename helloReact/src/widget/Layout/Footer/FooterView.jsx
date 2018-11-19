// 加载React
import React from 'react'
// 加载Component
import { Component } from 'react'

import styles from './FooterStyle.less'
import { config } from '../../../utils'

// 导出组件
export default class extends Component {
  // 构造函数
  constructor(props, context) {
    super(props, context)
    this.state = {}
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

  // 初始状态或状态变化会触发render
  render(ReactElement, DOMElement, callback) {
    return (
      <div className={styles.footer}>
        {config.footerText}
      </div>
    )
  }
}
