// 加载React
import React from 'react'
// 加载Component
import { Component } from 'react'
import styles from './HeaderStyle.less'

// 导出组件
export default class extends Component {
  // 构造函数
  constructor(props, context) {
    super(props, context)
    this.state = {}
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
  componentDidMount() {}

  //组件将被卸载
  componentWillUnmount(){}

  // 渲染选项卡
  renderTabs(){
    return React.Children.map(this.props.children, (child, i) => {
      return React.cloneElement(child)
    })
  }

  // 左滑
  goLeft(e){
    // 阻止事件冒泡
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    if(!!this.props.doGoLeft){
      this.props.doGoLeft()
    }
  }

  // 右滑
  goRight(e){
    // 阻止事件冒泡
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    if(!!this.props.doGoRight){
      this.props.doGoRight()
    }
  }

  // 全部关闭
  closeAllTabs(e){
    // 阻止事件冒泡
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    if(!!this.props.doCloseAll){
      this.props.doCloseAll()
    }
  }


  // 初始状态或状态变化会触发render
  render(ReactElement, DOMElement, callback) {

    return (
      <div className={styles.header} style={{paddingLeft: '16px'}}>
        <div className={styles.tabBarStyle}>
          { this.renderTabs() }
        </div>

        <div className={styles.rightWarpper}>
          <div className={styles.scroll} onClick={ e => { this.closeAllTabs(e) } } title='关闭全部'>
            <i className={'iconfont icon-guanbiquanbu'} style={{'fontSize': '22px', 'color': '#999'}}></i>
          </div>
          <div className={styles.scroll} onClick={ e => { this.goLeft(e) } } title='向左滑动'>
            <i className={'iconfont icon-back'} style={{'fontSize': '18px', 'color': '#999'}}></i>
          </div>
          <div className={styles.scroll} onClick={ e => { this.goRight(e) } } title='向右滑动'>
            <i  className={'iconfont icon-forward'} style={{'fontSize': '18px', 'color': '#999'}}></i>
          </div>
        </div>
      </div>
    )
  }
}
