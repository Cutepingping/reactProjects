// 加载React
import React from 'react'
// 加载Component
import { Component, PureComponent } from 'react'
// 样式管理器
import cx from 'classnames'
// 定义html head
import {Helmet} from 'react-helmet'
// 全局皮肤样式
import * as skinStyle from 'css/skin.less'
// 公共样式
import 'css/common.less'
// 主题样式
import 'css/theme.less'
// 当前组件样式
import './AppStyle.less'
// 给文档添加皮肤样式
import bodyClass  from '../bodyClass'
// 站点配置
import {config} from 'utils'
// 头部组件
import Banner from '../Banner/BannerView'
// 左侧栏组件
import Sider from '../Sider/SiderView'
// 页签组件
import YxTab from 'widget/PageTabs'
// 引入DVA路由组件
import { Link, hashHistory } from 'dva/router'

// 引入底部组件
import Footer from '../Footer/FooterView'
// 引入面包屑
import Bread from '../Bread/Bread'
import { connect } from 'dva'
import { has, get } from 'lodash'
import {getLocalData} from 'utils/globalScope'

// 设置当前tab的key
const setCurrTabKey = (location) => {
  window.CURR_TAB_KEY = location.pathname
}

// 导出组件
function AppView({children, location, dispatch, app, loading}){
  if(has(config, 'noTab')){
    // 设置当前tab的key
    setCurrTabKey(location)
  }

  // 当前选项卡 - 标题 + 路由对象
  const { currTabTitle } = app
  // 给文档添加皮肤样式
  bodyClass()
  //企业中心，需判断是否有门户传来的auth
  if(config.isB2bLogin) {
    let tmpAuth = get(getLocalData(config.userInfoKey), 'auth', '');
    tmpAuth || (window.location.href = config.redirectLoginUrl);
  }

  // 渲染内容
  return (
    <div className='layout-ns-g'>
      {/* 重定义html的head */}
      <Helmet>
        <title>{ config.appName }</title>
      </Helmet>

      <div className='layout' id="layoutCont">
        {/* 顶部banner - 包含logo、系统名称、登录者名称等 */}
        <Banner/>

        {/* 左侧栏 - 包含操作菜单 */}
        <aside className='sider'>
          <Sider/>
        </aside>

        {/* 右侧内容区 - 包含页签 */}
        <div className='main'>
          {/* 无页签的情况 */}
          {
            has(config, 'noTab') && (
              <div>
                <Bread location={location} currTabTitle={currTabTitle}/>
                <div name='tabContainer' style={{'margin': '16px',  'minHeight': 'calc(100vh - 180px)'}}>
                  <div key={location.pathname}>
                    { children }
                  </div>
                </div>
                <Footer />
              </div>
            )
          }

          {/* 有页签的情况 */}
          {
            !has(config, 'noTab') && (
              <YxTab
                tabProps={ children }
                headerProps={null}
                location={ location }
                currTabTitle={ currTabTitle }
              />
            )
          }
        </div>

      </div>
    </div>
  )

}

export default connect(({app, loading}) => ({app, loading: loading.models.app}))(AppView)
