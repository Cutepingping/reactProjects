// 加载React
import React from 'react'
// 加载Component
import { Component } from 'react'
// Cookie对象
import Cookie from 'js-cookie'
// 路由对象
import { hashHistory } from 'dva/router'

// 引入antd的组件
import {Menu, Icon, Dropdown, Select } from 'antd'
// 站点配置
import config from '../../../config/config'
// 弹出提示框
import { messageInform } from '../../../utils/notification'

// 加载当前组件样式
import styles  from './BannerView.less'
// 注销登录
import { delCacheUser } from './BannerServ'

// 引入我的消息组件
import MsgList  from '../MsgList/msgListView'
// 引入组织机构组件
import OrgList from '../OrgList/orgListView'
// 引入商户信息组件
import SellerInfo from '../SellerInfo/sellerInfoView'

// 引入修改密码对话框
import UpdatePwd from '../UpdatePwd/updatePwdView'
// 登录跳转的方法
import { customLoginRedirect } from '../../../utils/redirect_utils'
import cx from 'classnames'
import logoImg from '../../../assets/img/logo.png'

// 是否已加载成功
let loadedSuccess = false

// 导出组件
export default class extends Component{

  // 构造函数
  constructor(props, context) {
    super(props, context);
    this.state = {
      updatePwdFlag: false,
    }
  }

  // 已插入DOM
  componentDidMount(){
    let self = this

    loadedSuccess = true
  }

  // 比较对话框状态，已确保是否需要重新渲染
  getPwdDlgFlag(nextState){
    if('' + this.state.updatePwdFlag === '' + nextState.updatePwdFlag){
      return false
    }else{
      return true
    }
  }

  // 是否触发render函数
  shouldComponentUpdate(nextProps, nextState) {
    let self = this

    // 若已渲染过，则不重新渲染
    if(loadedSuccess){
      if(self.getPwdDlgFlag(nextState)){
        return true
      }else{
        return false
      }
    }else{
      return true
    }
  }

  // 删除Cookie
  clearCookie(){
    Cookie.remove(config.cookie.userName)
    Cookie.remove(config.cookie.auth)
    localStorage.removeItem('antdAdminSiderFold')
    sessionStorage.removeItem('SIDER_OPEN_KEY')
    sessionStorage.removeItem('SIDER_SELECTED_KEY')
  }

  // 执行退出
  async doLogout(){
    let self = this
    if(!config.isLogin){
      // 清除Cookie
      self.clearCookie()
      // 注销成功提示
      messageInform('注销成功', 'success')
      // 跳转到登录页
      hashHistory.push('/login')
      return false
    }
    // 注销登录
    let { resultCode, resultMsg } = await delCacheUser({})

    if('0' === '' + resultCode){
       // 清除Cookie
      self.clearCookie()
      // 注销成功提示
      messageInform('注销成功', 'success')

      // // 跳转到登录页
      // hashHistory.push('/login')
      customLoginRedirect()
    }
  }

  // 打开密码对话框
  showPwdDlg(e){
    this.setState({
      updatePwdFlag: true
    }, () => {
      console.log('this.state.updatePwdFlag:', this.state.updatePwdFlag)
    })
  }

  // 关闭密码对话框
  hidePwdDlg(e){
    this.setState({
      updatePwdFlag: false
    })
  }

  // 下拉菜单点击事件
  handleClickMenu(e){
    let self = this
    // 点击那一项
    switch('' + e.key){
      case 'logout':
        // 退出登录
        self.doLogout()
        break
      case 'forgetPassword':
        self.showPwdDlg(e)
        break
      default:
        console.log('unknown key')
    }
  }

  // 点击用户登录信息的下拉菜单
  getDropDownMenu(){
    return (
      <Menu onClick={ e => this.handleClickMenu(e) }>
        <Menu.Item key="forgetPassword">
          <a style={{width: 120}}><i className="iconfont icon-xiugaimima mg1r"  />修改密码</a>
        </Menu.Item>
        <Menu.Item key="logout">
          <a style={{width: 120}}><i className="iconfont icon-zhuxiao mg1r"/>注销</a>
        </Menu.Item>
      </Menu>
    )
  }

  //跳转到经销商门户
  goToB2bWeb() {
    location.href = config.baseURL + '/' + config.b2bWebHomePath;
  }

  // 渲染用户信息
  renderUserInfo(){
    const userName = Cookie.get(config.cookie.userName + '_name');
    return (
      <div className={cx(styles.user)}>
        <img src="https://avatars2.githubusercontent.com/u/80?s=400&v=4" alt=""/>
        <Dropdown overlay={ this.getDropDownMenu() } trigger={['click']} getPopupContainer={() => document.getElementById('routerApp_headRight')}>
          <a className="ant-dropdown-link block" href="#" title={userName} style={{maxWidth: 240, paddingLeft: 8}}>
            <span style={{maxWidth: 210}} className="ellipsis iblock">{ userName }</span><Icon type="down" />
          </a>
        </Dropdown>
      </div>
    )
  }

  // 渲染内容
  render(){
    let imgLogo = ''
    return (
      <div>
        {/* 弹出的修改密码对话框 - 默认隐藏 */}
        {
          this.state.updatePwdFlag && <UpdatePwd titleName='修改密码' visible={ this.state.updatePwdFlag } onClose={ e => { this.hidePwdDlg(e) } }/>
        }
        <div className={styles.tophead}>
          {/* 左侧header */}
          <div className={styles.headLeft}>
            <span className={styles.tableCell}>
              <img className={styles.headLogo} src={logoImg} alt=""/>
            </span>
            <span className={styles.tableCell}>|</span>
            <span className={styles.tableCell}>
              {config.appName || ''}
              <SellerInfo/>
            </span>
          </div>
          {/* 右侧header */}
          <div className={styles.headRight} id="routerApp_headRight">
            {
              config.sysType === 'entCenter' && <div className={cx(styles.enterpriseInfo, 'fright')}>
                <a className="mg2r" style={{color: 'white'}} onClick={() => this.goToB2bWeb()}>门户首页</a>
                <a title="退出登录" style={{color: 'white'}}><Icon className="mg2r" type="poweroff" onClick={() => this.handleClickMenu({key: 'logout'})}/></a>
              </div>
            }
            {/* 组织机构列表*/}
            <OrgList/>
            {
              //用户登录信息
              config.sysType === 'entCenter' || this.renderUserInfo()
            }
            {/* 消息列表 */}
            <MsgList/>
          </div>

        </div>
      </div>
    )
  }
}
