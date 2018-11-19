// 加载React
import React from 'react'
// 加载Component
import { Component } from 'react'

import { parse } from 'qs'
// 引入antd的组件
import { Carousel, Badge } from 'antd'
import { Link, hashHistory } from 'dva/router'

// 站点配置
import config from '../../../config/config'
// 弹出提示框
import { messageInform } from '../../../utils/notification'

import styles from './msgListStyle.less'
import { myList } from './msgListServ'

// 导出组件
export default class extends Component {
  // 构造函数
  constructor(props, context) {
    super(props, context)
    this.state = {
      // 我的消息列表
      myMsgList: []
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
    self.getMsgList()
  }

  // 是否触发render函数
  shouldComponentUpdate(nextProps, nextState) {
    let self = this
    // 若不配置消息开关，则不渲染
    if(!config.isMsgNotify){
      return false
    }else{
      return true
    }
  }

  //组件将被卸载
  componentWillUnmount(){}

  // 获取消息列表
  async getMsgList(){
    try{
      if(!config.isMsgNotify) return false
      // 查询我的消息
      let result = await myList(parse({ status: 0, pageNum: 1, pageSize: 5}))

      if('0' === '' + result.resultCode){
        // 设置到状态机
        this.setState({ myMsgList: result.data.list })
      }

    }catch(e){
      messageInform(e || '未知的查询消息异常', 'error')
    }
  }

  // 渲染消息列表
  renderMsgList(){
    // 消息列表不为空时
    if(0 !== this.state.myMsgList.length){
      return (
        <div className={styles.notice}>
          <i className="iconfont icon-xiaoxi"></i>
          <Badge count={ this.state.myMsgList.length } style={{backgroundColor:'#FFB840',right:'-13px',top:'-19px',width:'30px',boxShadow: 'none'}}/>
          <Carousel vertical autoplay>
            {
              this.state.myMsgList && this.state.myMsgList.length > 0 && (
                this.state.myMsgList.map((item,i) => {
                  return <div key={'msg_'+i}><Link to="/messageManage/myMessage">{item.title}</Link></div>
                })
              )
            }
          </Carousel>
        </div>
      )

    }else{
      if(config.isMsgNotify){
        return (
          <div className={styles.notice} style={{width:51}}>
            <i className="iconfont icon-xiaoxi"></i>
            <Badge count={ this.state.myMsgList.length } style={{backgroundColor:'#FFB840',right:'-13px',top:'-19px',width:'30px',boxShadow: 'none'}}/>
          </div>
        )
      }else{
        return ''
      }
    }
  }

  // 初始状态或状态变化会触发render
  render(ReactElement, DOMElement, callback) {
    return (
      <div>{ this.renderMsgList() }</div>
    )
  }
}
