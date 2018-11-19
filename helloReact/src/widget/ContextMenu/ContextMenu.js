// 引入React库
import React, {Component} from 'react'

// 显示多个样式类名
import cx from 'classnames'
// 引入组件样式
import styles from './ContextMenu.less'

// 右键组件
export default class extends Component{
  // 构造函数
  constructor(props, context) {
    super(props, context)
    this.state = {
      // 是否展示菜单
      showMenu: false,
      // 菜单样式
      style: {},
      // 菜单项
      menuList: []
    }
  }

  //准备：即将被重新渲染，状态未变化
  componentWillMount() {}

  // 已加载组件，收到新属性时调用
  componentWillReceiveProps(nextProps) {
    if(!nextProps.menuList) return false
    this.setState({
      menuList: nextProps.menuList
    })
  }

  // 已插入真实DOM
  componentDidMount() {
    if(!this.props.menuList) return false
    this.setState({
      menuList: this.props.menuList
    })
  }

  // 阻止事件冒泡
  stopPropagation(e){
    // 取消默认的浏览器自带右键
    e.preventDefault();
    // 阻止事件冒泡
    e.stopPropagation();
    // 阻止React本地事件冒泡
    e.nativeEvent.stopImmediatePropagation()
  }

  // 关闭菜单
  closeMenuItem(){
    // 作用域提升
    let self = this
    // 隐藏菜单
    self.setState({
      showMenu: false,
      style: {
        width: '0px',
        left: '0px',
        top: '0px'
      }
    })
  }

  // 右键触发打开菜单
  onContextMenu(e){
    // 作用域提升
    let self = this
    // 阻止冒泡
    self.stopPropagation(e)

    // 菜单样式
    let {style} = this.state

    style.width = style.width || '160px'
    style.left = (e.clientX || 0) + 'px'
    style.top = (e.clientY || 0) + 'px'

    // 展示菜单
    self.setState({
      showMenu: true,
      style
    })

    // 监听窗体点击事件，点击则关闭菜单
    window.addEventListener('click', () => self.closeMenuItem(), false)
  }

  // 点击菜单
  onMenuChange(e, i, handleClick){
    // 作用域提升
    let self = this
    // 阻止冒泡
    self.stopPropagation(e)
    // 关闭菜单
    self.closeMenuItem()

    // 触发回调
    if(!!handleClick){
      handleClick(i)
    }
  }

  // 菜单切换
  toggleMenuItem(i, flag){
    // 作用域提升
    let self = this
    // 菜单列表
    let {menuList} = self.state

    // 菜单为空
    if(0 === menuList.length) return false

    // 遍历菜单
    menuList.map((m, j) => {
      if('' + i === '' + j){
        if(flag){
          m.cls = cx(styles.reactContextmenuItem, styles.reactContextmenuItemSelected)
        }else{
          m.cls = cx(styles.reactContextmenuItem)
        }
        return
      }
    })
    self.setState({menuList})
    return false
  }

  // 鼠标移过事件
  onMouseOver(e, i){
    // 作用域提升
    let self = this
    // 阻止冒泡
    self.stopPropagation(e)
    // 高亮
    self.toggleMenuItem(i, true)
    return false
  }

  // 鼠标移出事件
  onMouseOut(e, i){
    // 作用域提升
    let self = this
    self.stopPropagation(e)
    // 恢复
    self.toggleMenuItem(i, false)
  }

  // 菜单栏样式
  navCls(){
    return cx(styles.reactContextmenu, this.state.showMenu? styles.reactContextmenuVisible: '')
  }

  // 分割条样式
  itemDivider(){
    return cx(styles.reactContextmenuItem, styles.reactContextmenuItemDivider)
  }

  renderBody(){
    return (
      <div>
        <div className={styles.reactContextmenuWrapper}>
          {
            React.Children.map(this.props.children, (child, i) => {
              return React.cloneElement(child, {onContextMenu: e => this.onContextMenu(e)})
            })
          }
        </div>
        <nav className={ this.navCls() } style={this.state.style}>
          {
            this.state.menuList && this.state.menuList.map((m, i) => {
              return (
                <div key={'menu_item_' + i}>
                  <div className={ cx(m.cls) || cx(styles.reactContextmenuItem)}
                    onMouseOver={ e => this.onMouseOver(e, i)}
                    onMouseOut={ e => this.onMouseOut(e, i) }
                    onClick={e => this.onMenuChange(e, i, m.handleClick)}
                  >
                    <span>{m.text}</span>
                  </div>
                  {
                    i !== this.state.menuList.length - 1 && (
                      <div className={ this.itemDivider()}></div>
                    )
                  }
                </div>
              )
            })
          }
        </nav>
      </div>
    )
  }

  // 渲染函数
  render() {
    return this.renderBody()
  }

}
