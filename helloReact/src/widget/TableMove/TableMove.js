/**
 * 这个组件由于处理列表项上移下移的键盘事件绑定与解绑
 * @prop {[function]} cb [传入列表项移动的方法，接收一个keyCode参数]
 */

import React, { Component } from 'react'

class TableMove extends Component {
  constructor(props) {
    super(props)
    this.cb = this.cb.bind(this)
  }
  //组件卸载时解绑键盘事件
  componentWillUnmount() {
    document.removeEventListener('keydown', this.cb)
  }
  //组件挂载时绑定键盘事件
  componentDidMount() {
    document.addEventListener('keydown', this.cb)
  }

  cb(e) {
      this.props.cb(e.keyCode)
  }
  render() {
    return (
      <div></div>
    )
  }
}

export default TableMove
