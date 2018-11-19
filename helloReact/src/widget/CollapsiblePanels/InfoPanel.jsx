import React from 'react';
import {Icon} from 'antd';
import styles from './InfoPanel.less'
import cx from 'classnames'

const {Component} = React
export default class extends Component {
  // 构造函数
  constructor(props, context) {
    super(props, context);
    this.state = {
      collapse: false,
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

  changeStatus() {
    this.setState({collapse: !this.state.collapse})
  };

  render() {
    return (
      <div style={{marginTop: 16}} className={cx(styles.panel, 'pad2')}>
        <a className={cx('txtleft', styles.collapseBtn)} onClick={() => this.changeStatus()}>
          {
            this.state.collapse
              ? <i className="iconfont icon-zhankai mg1l" />
              : <i className="iconfont icon-shouqi mg1l" />
          }
        </a>
        <div className={this.state.collapse ? styles.collapse: ''}>
          {this.props.children}
        </div>
      </div>
    )
  }
}
