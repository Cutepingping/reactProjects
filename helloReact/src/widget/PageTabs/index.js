// 引入React库
import React, {Component} from 'react'

// 显示多个样式类名
import cx from 'classnames'
// 当前组件样式
import tabStyles from './index.less'

// import * as Layout from '../../widget/Layout'

import ContextMenu  from '../ContextMenu/ContextMenu'

import {remove, cloneDeep, slice, startsWith, get } from 'lodash'

import { hashHistory } from 'dva/router'

// 引入头部等组件
import Header from '../Layout/Header/HeaderView'

import Footer from '../Layout/Footer/FooterView'

import styles from '../Layout/App/AppStyle.less'
// CSS过度
// import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup'

import AppBus from '../../utils/bus'

import Bread from '../Layout/Bread/Bread'

// 选项卡组件
export default class extends Component{
  // 构造函数
  constructor(props, context) {
    super(props, context)
    this.state = {
      isDva: false,
      isReload: false,
      headerProps: {},
      location: {},
      locationMap: {},
      currentTabKey: '',
      currTabTitle: '',
      tabPanes: [],
      menuList: [],
      tabWid: '1px',
      maxTabCount: 20
    }
  }

  //准备：即将被重新渲染，状态未变化
  componentWillMount() {
  }

  // 已加载组件，收到新属性时调用
  componentWillReceiveProps(nextProps) {
    if(!nextProps.tabProps) return false
    this.onAddTabs(nextProps)
  }

  // // 组件是否被渲染 - 解决页签里的组件重复渲染问题
  // shouldComponentUpdate(nextProps, nextState) {
  //   // 如果旧组件的key和新组件的一致，则不重新渲染
  //   if('' + this.props.location.key === '' + nextProps.location.key){
  //     // key值一样时，如果是刷新页面或首次打开，则需要渲染
  //     if('' + this.state.isReload !==  '' + nextState.isReload){
  //       return true
  //     }else{
  //       return false
  //     }
  //   }else{
  //     return true
  //   }
  // }

  // 选项卡切换
  onTabChange(activeKey, e){
    // 阻止事件冒泡
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation()
    let {locationMap, isReload} = this.state
    this.setState({ currentTabKey: activeKey, location: locationMap['' + activeKey], isReload: !isReload})
    return false
  }

  // 全部关闭
  closeAll(){
    let self = this
    let {tabPanes} = self.state
    if(0 === tabPanes.length) return false
    self.setState({
      tabPanes: []
    }, () => {
      // 跳转到默认目录
      // hashHistory.push('/')
      hashHistory.push('/home')
    })
  }

  // 初始化菜单
  loadMenuList(){
    // 作用域提升
    let self = this
    let {menuList, tabPanes} = self.state
    if(0 !== menuList.length){
      return
    }
    // 菜单项
    menuList = [
      // {
      //   text: '刷新页面',
      //   handleClick: (e) => {
      //     console.log('刷新页面', e)
      //   }
      // },
      // {
      //   text: '全部关闭',
      //   handleClick: (e) => {
      //     if(0 === tabPanes.length) return false
      //     tabPanes.map((tab, i) => {
      //       // 销毁内存，回收对象
      //       tab = null
      //     })
      //     // 全部清空
      //     remove(tabPanes, () => {return 1 === 1})
      //     self.setState({tabPanes: []})
      //   }
      // }
    ]
    self.setState({menuList})
  }

  // 限制页签个数
  limitTabCount(){
    // 作用域提升
    let self = this
    // 是否继续往下
    let flag = false

    let currTabCount = this.state.tabPanes.length

    // 页签的个数超过一定数量，则不再追加页签，中断执行
    if(currTabCount > 0 && (currTabCount > this.state.maxTabCount)){
      this.state.tabPanes[0].content = null
      // 第一个元素的内存释放
      this.state.tabPanes[0] = null
      // 临时数组，用于存放页签
      let tmpArr = this.state.tabPanes
      // 移除第一个元素
      tmpArr.splice(0, 1)
      // 放回状态机
      self.setState({tabPanes: tmpArr})
      // 中断执行
      flag = false

    // 页签小于限制范围，则继续往下走
    }else{
      flag = true
    }
    return flag
  }

  // 追加标签页
  onAddTabs(payload){
    // 作用域提升
    let self = this
    // 取出地址映射
    let {locationMap} = this.state
    // 选项卡属性、头部属性、路由属性
    let {tabProps, headerProps, location, currTabTitle} = payload

    // 是否DVA
    let isDva = !tabProps.props? false: true
    // 是否重新加载
    let isReload = isDva

    self.setState({isDva, headerProps, location, isReload})

    /* 路由列表
     * 普通的React使用props.routes
     * DVA无状态组件使用props.props.routes
    */
    let routes = !isDva? tabProps.routes: tabProps.props.routes
    // 路由对象
    let routeObj = routes[routes.length - 1]
    // react-router传入的key
    let key = routeObj.path

    // 如果key无值
    if(!key){
      this.state.tabPanes.length = 0
      return
    }

    if(-1 === key.indexOf('home/')){
      key = `home/${key}`
    }

    // 克隆的key
    let cloneKey = key
    // 路由中文名 - 页签标题
    let name = routeObj.name

    // 选项卡个数
    if (!this.tabCount) {
      this.tabCount = 0
    }

    // this.tabCount ++

    // 若允许同一路由可以重复打开，则放开注释
    // key = key + this.tabCount

    // 设置路由对象
    locationMap['' + key] = location
    self.setState({locationMap})

    // 加载右键菜单
    self.loadMenuList()

    // 更新当前选中的tab的key
    this.state.currentTabKey = key

    // 当前key对应的tab是否已显示
    let exist = false
    for (const pane of this.state.tabPanes) {
      if ('' + pane.key === '' + key) {
        exist = true
        break
      }
    }

    // 当前标题
    let currTitle = currTabTitle.title || name
    // 当前key
    let currKey = self.getCurrKey(currTabTitle)

    /*
     * 添加选项卡到列表
     * DVA无状态组件使用props
     * 普通的React使用props.children
    */
    if(!exist){
      let tmpArr = this.state.tabPanes
      if('' + key === '' + currKey){
        if(currTabTitle && currTabTitle.title){
          name = currTabTitle.title
        }
      }
      tmpArr.push({
        key,
        title: name,
        content: isDva? tabProps: tabProps.children
      })
      this.setState({tabPanes: tmpArr}, () => {
        self.limitTabCount()
        self.setMaxTabWidth()
      })
    }else{
      self.setTabTitle(currKey, currTitle)
    }
  }

  // 获取当前key
  getCurrKey(currTabTitle){
    if(!currTabTitle) return false
    let pathname = currTabTitle.location.pathname
    let currKey = pathname.slice(1)
    return currKey
  }

  // 设置页签标题
  setTabTitle(currKey, currTitle){
    // 作用域提升
    let self = this
    // 克隆一份
    let cloneTabPanes = cloneDeep(this.state.tabPanes)
    // 为空，则中断执行
    if(0 === cloneTabPanes.length) return false
    // 查找到当前key
    cloneTabPanes.map((tab, i) => {
      if('' + currKey === '' + tab.key){
        tab.title = currTitle
        return
      }
    })
    // 设置回状态机
    self.setState({tabPanes: cloneTabPanes})
  }

  // 关闭tab时的回调
  onTabRemove = (targetKey, e, cbf) => {
    if(!!e){
      // 阻止事件冒泡
      e.stopPropagation();
      e.nativeEvent.stopImmediatePropagation();
    }
    // 如果关闭的是当前tab, 要激活哪个tab

    // 首先尝试激活左边的, 再尝试激活右边的
    let nextTabKey = this.state.currentTabKey

    if ('' + this.state.currentTabKey === '' + targetKey) {

      let currentTabIndex = -1
      this.state.tabPanes.forEach((pane, i) => {
        if (pane.key === targetKey) {
          currentTabIndex = i
        }
      })

      // 如果当前tab左边还有tab, 就激活左边的
      if (currentTabIndex > 0) {
        nextTabKey = this.state.tabPanes[currentTabIndex - 1].key
      }
      // 否则就激活右边的tab
      else if (currentTabIndex === 0 && this.state.tabPanes.length > 1) {
        nextTabKey = this.state.tabPanes[currentTabIndex + 1].key
      }
      // 其实还有一种情况, 就是只剩最后一个tab, 但这里不用处理
    }
    // location的值
    let location = get(this.state.locationMap, `[${nextTabKey}]`, this.state.location)
    // 过滤panes
    const newTabPanes = this.state.tabPanes.filter(pane => pane.key !== targetKey)
    // 放入状态机
    this.setState({ tabPanes: newTabPanes, currentTabKey: '' + nextTabKey, location }, () => {
      if(!e){
        cbf && cbf()
      }else{
        // 无页签时，跳转到默认首页
        if(0 === newTabPanes.length){
          // hashHistory.push('/')
          hashHistory.push('/home')
        }
      }
    })
  }

  // 已插入真实DOM
  componentDidMount() {
    let self = this

    // 监听页签关闭事件
    AppBus.on('closeTab', (e) => {
      let key = e.key
      if(!key){
        throw new Error('The key of closeTab event is not empty')
      }
      if(startsWith(key, '/')){
        key = key.substring(1)
      }
      self.onTabRemove(key, null, e.cbf)
    });

    // 监听页签全部关闭事件
    AppBus.on('closeAllTab', (e) => {
      self.closeAll()
    });

    if(!self.props.tabProps) return false

    self.onAddTabs(self.props)
  }

  // 获得tab的最大宽度
  setMaxTabWidth(){
    let self = this
    if(!!self.refs.tabDomList){
      let totalWidth = 0
      let tabDomObj = self.refs.tabDomList
      let tabDomWidth = tabDomObj.offsetWidth

      let ulObj = tabDomObj.children[0]
      let liArr = ulObj.children

      if(liArr.length > 0){
        let i = 0, len = liArr.length
        for (; i < len; i++) {
          totalWidth += (liArr[i].offsetWidth + 6)
        }
      }

      // 页签总宽度大于容器总宽度，则向右滑动
      if(totalWidth >= tabDomWidth - 138){
        self.swipeRight()
      }
    }
  }

  // 选项卡左滑
  swipeLeft(){
    let self = this
    self.refs.tabDomList.scrollLeft -= 138
  }

  // 选项卡右滑
  swipeRight(){
    let self =  this
    self.refs.tabDomList.scrollLeft += 138
  }

  // 渲染选项卡
  renderTabNav(){
    return (
      <div ref='tabDomContainer'  className={tabStyles.tabContainer}>
        <div className={tabStyles.tabListContainer}>
          <div ref='tabDomList' className={tabStyles.tabList}>
            <ul>
              {
                this.state.tabPanes && this.state.tabPanes.map((pan, i) => {
                  return (
                    <li key={'nav_' + i} className={cx(tabStyles.tabItems, '' + this.state.currentTabKey === '' + pan.key? tabStyles.active: '')}>
                      {
                        0 === this.state.menuList.length && (
                          <a className={tabStyles.link} href="javascript:;" onClick={ e => this.onTabChange('' + pan.key, e)}>
                            <span className={tabStyles.title}> {pan.title} </span>
                            <i className={cx('iconfont', 'icon-close', tabStyles.icon)} onClick={e => {this.onTabRemove('' + pan.key, e)}}/>
                          </a>
                        )
                      }
                      {
                        0 !== this.state.menuList.length && (
                          <ContextMenu menuList={this.state.menuList}>
                            <a className={tabStyles.link} href="javascript:;" onClick={ e => this.onTabChange('' + pan.key, e)}>
                              <span className={tabStyles.title}> {pan.title} </span>
                              <i className={cx('iconfont', 'icon-close', tabStyles.icon)} onClick={e => {this.onTabRemove('' + pan.key, e)}}/>
                            </a>
                          </ContextMenu>
                        )
                      }

                    </li>
                  )
                })
              }
            </ul>
          </div>
        </div>
      </div>
    )
  }

  // 渲染选项卡内容
  renderContent(){
    return (
      <div>
        {
          this.state.tabPanes && this.state.tabPanes.map((pan, i) => {
            if(this.state.currentTabKey === '' + pan.key){
              // window.CURR_TAB_KEY = '' + pan.key
              window.CURR_TAB_KEY = '/' + pan.key
            }
            return (
              <div key={'content_' + i} className={cx(tabStyles.fade, '' + this.state.currentTabKey === '' + pan.key? tabStyles.in: '')}>
                {/*
                  '[object Object]' === '' + Object.prototype.toString.call ? <div>{pan.content}</div> : <div dangerouslySetInnerHTML={{__html:pan.content}}/>
                */}
                <div>{'' + this.state.currentTabKey === '' + pan.key? pan.content: ''}</div>
              </div>
            )
          })
        }
      </div>
    )
  }

  renderBody(){

    // 如果是DVA的场景
    if(this.state.isDva){
      return (
        <div>
          <Header {...this.state.headerProps} doGoLeft={ () => this.swipeLeft() } doGoRight={ () => this.swipeRight()} doCloseAll={ () => this.closeAll() }>
            { this.renderTabNav() }
          </Header>
          {
            this.state.tabPanes && this.state.tabPanes.length > 0 && (
              <Bread location={this.state.location}/>
            )
          }
          <div name='tabContainer' className={styles.container}>
            <div className={styles.content} key={this.state.location.pathname}>
              {/*
              <CSSTransitionGroup transitionName="bodyAnimations" transitionAppear={true} transitionAppearTimeout={500}
                transitionEnter={false} transitionLeave={false}>
                { this.renderContent() }
              </CSSTransitionGroup>
              */}
              { this.renderContent() }
            </div>
          </div>
          <Footer />
        </div>
      )
    }

    // React原生组件的场景
    if(0 === this.state.tabPanes.length){
      return (
        <div>&nbsp;</div>
      )
    }

    return (
      <div>
        { this.renderTabNav() }
        { this.renderContent() }
      </div>
    )
  }

  // 渲染函数
  render() {
    return this.renderBody()
  }

}
