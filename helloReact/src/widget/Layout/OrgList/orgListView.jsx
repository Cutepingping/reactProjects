// 加载React
import React from 'react'
// 加载Component
import { Component } from 'react'

// 引入antd的组件
import { Select, Dropdown, Menu, Icon } from 'antd'
// 样式管理器
import cx from 'classnames'

// 站点配置
import config from '../../../config/config'

import styles from './orgListStyle.less'
import { getUserOrg } from './orgListServ'

import { setLocalData, getLocalData } from '../../../utils/globalScope'
// 弹出提示框
import { messageInform } from '../../../utils/notification'
import {find, get} from 'lodash'
import {hashHistory} from 'dva/router'

// 导出组件
export default class extends Component {
  // 构造函数
  constructor(props, context) {
    super(props, context)
    this.state = {
      // 组织机构列表
      userOrgList: [],
      // 当前组织机构
      currentOrg: '',
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
    this.getOrgList()
  }

  //组件将被卸载
  componentWillUnmount(){}

  // 是否触发render函数
  shouldComponentUpdate(nextProps, nextState) {
    let self = this
    // 若不配置组织机构开关，则不渲染
    if(!config.isMultiOrg){
      return false
    }else{
      return true
    }
  }

  // 获取组织机构列表
  async getOrgList(){
    try{
      if(!config.isMultiOrg) return false
      // 查询用户组织结构
      //企业中心显示为经销商下拉数据，从localstorage里获取
      if(config.isB2bLogin) {
        const userInfo = getLocalData(config.userInfoKey);
        let orgList = get(userInfo, 'data.orgList', []);
        let currOrgId = get(userInfo, 'data.orgId', '');
        this.setState({
          userOrgList: orgList,
          currentOrg: currOrgId
        })
      } else {
        let result = await getUserOrg()

        if ('0' === '' + result.resultCode) {
          this.setState({
            userOrgList: result.data,
            currentOrg: get(result, 'data.orgInfo.orgName', '')
          })
        }
      }

    }catch(e){
      messageInform(e || '未知的查询组织异常', 'error')
    }
  }
  //组织切换
  orgChange(v) {
    const {currentOrg} = this.state;
    if(currentOrg + '' === v + '') {
      return
    }
    const userInfo = getLocalData(config.userInfoKey);
    let orgList = get(userInfo, 'data.orgList', []);
    if(userInfo) {
      userInfo.data.orgId = v
      setLocalData(config.userInfoKey, userInfo);
      //刷新页面
      location.reload();
    }
  }

  // 渲染组织机构列表
  renderOrgList(){
    const {userOrgList, currentOrg} = this.state;

    if(config.isMultiOrg){
      const orgListMenu = <Menu onClick={e => this.orgChange(e.key)}>
        {
          currentOrg && userOrgList && userOrgList.length > 0
            ? userOrgList.map((item, index) => (
            <Menu.Item key={item.id + ''}>{item.name}</Menu.Item>
          ))
            : <Menu.Item key={'default'}>集团</Menu.Item>
        }
      </Menu>

      return (
        <div className={ cx(styles.org, 'mg2r') }>
          {
            config.sysType === 'entCenter' || <div className={styles.tableCell}><span className={ cx('ant-divider') }/></div>
          }
          {
            config.sysType === 'entCenter'
              ? <div className={styles.tableCell}>
                  您好，
                  <Dropdown overlay={orgListMenu}
                    getPopupContainer={() => document.getElementById('routerApp_headRight')}>
                   <span>
                    {currentOrg ? get(find(userOrgList, item => item.id + '' === currentOrg + ''), 'name', '集团') : '集团'}
                    <Icon className="mg1l" style={{fontSize: 10}} type="caret-down" />
                  </span>
                </Dropdown>
              </div>
              : <div className={styles.tableCell}>
                  <a className="ant-dropdown-link block" title={currentOrg} style={{maxWidth: 240, paddingLeft: 8}}>
                    <span style={{maxWidth: 210}} className="ellipsis iblock">{ currentOrg }</span>
                  </a>
              </div>
          }
        </div>
      )
    }else{
      return ''
    }
  }

  // 初始状态或状态变化会触发render
  render(ReactElement, DOMElement, callback) {
    return (
      <div> { this.renderOrgList() } </div>
    )
  }
}
