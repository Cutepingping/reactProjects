import React from 'react';
import {Icon} from 'antd';
import styles from './CustomCard.less'
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

  render() {
    return (
      <div className={cx(this.props.className)}>
        <div className={styles.title}>{this.props.title}</div>
        <div className="pad1">
          {this.props.children}
        </div>
      </div>
    )
  }
}
