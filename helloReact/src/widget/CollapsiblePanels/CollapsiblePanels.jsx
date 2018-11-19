import React from 'react';
import {Icon} from 'antd';
const { Component } = React
import cx from 'classnames'
import styles from './CollapsiblePanels.less'
import $ from 'jquery'
import { has } from 'lodash'

export default class extends Component {
  // 构造函数
  constructor(props, context) {
    super(props, context);
    this.state = {
      collapse:true,
    }
  }

  componentWillUpdate(nextProps, nextState) {
  }

  componentDidUpdate(prevProps, prevState) {
  }

  componentWillReceiveProps(nextProps) {
  }

  componentDidMount() {
  }

  // 面板展开、折叠
  changeStatus() {
    this.setState({ collapse:!this.state.collapse })
  }

  render() {
    let hasHideUpDownBtn = has(this.props, 'hideUpDownBtn', false)

    return (
      <div style={{marginTop:16, ...this.props.style}} className={this.props.className}>
        { /* 面板头部 */ }
        <dl className={cx(styles.dlMain, 'dropdownShadow')}>

              <dt className={`${!this.state.collapse ? 'slideHide' : ''}`} style={ this.props.titleBarStyle }>
                { this.props.title }

                {
                  !hasHideUpDownBtn && (
                    <span onClick={() => this.changeStatus()} > { this.state.collapse? '收起': '展开' }
                      <Icon type="up"/>
                    </span>
                  )
                }
              </dt>

        { /* 面板内容 */ }
          <dd className={`${!this.state.collapse ? 'slideHide' : ''}`}>
            <div style={{padding: '16px'}}>
              {this.props.children}
            </div>
          </dd>

        </dl>
      </div>
    )
  }
}
