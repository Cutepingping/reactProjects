import React from 'react';
import {Icon} from 'antd';
const {Component} = React
import styles from './AdvanceSearch.less'
import cx from 'classnames'
export default class extends Component {
  // 构造函数
  constructor(props, context) {
    super(props, context);
    this.state = {
      collapse: true,
    }
  }

  componentWillUpdate(nextProps, nextState) {
  }

  componentDidUpdate(prevProps, prevState) {
  }

  componentWillReceiveProps(nextProps) {
    this.windowOnResize();
  }

  componentDidMount() {
    window.onresize = () => this.windowOnResize();
  }

  // 屏幕宽度改边触发的函数
  windowOnResize() {
    let winWidth = document.body.offsetWidth;
    let colNum = 2;
    let xs = 768, md = 992, lg = 1200, xl = 1600;
    let isDisplayBtn = false;
    let colData = this.props.children.props.data;

    //获取一行显示的列数
    if(winWidth < xs) {
      colNum = 2;
    }else  if(winWidth >= md && winWidth < lg) {
      colNum = 2;
    }else  if(winWidth >= lg && winWidth < xl) {
      colNum = 3;
    }else if(winWidth >= xl){
      colNum = 4;
    }

    //支持没有使用条件搜索组件的情况，可使用totalColNum代替
    if(this.props.totalColNum) {
      this.props.totalColNum > colNum && (isDisplayBtn = true);
    } else {
      if(colData && colData.length > colNum) {
        isDisplayBtn = true;
      }
    }

    this.setState({ colNum, isDisplayBtn });
  }

  changeStatus() {
    this.setState({collapse: !this.state.collapse})
  };

  render() {
    // 获取配置数据
    const { colNum, isDisplayBtn } = this.state;

    // 获取传入的子元素
    const propsChildren = this.props.children;
    // 获取搜索条件
    const queryList = propsChildren.props.data;

    return (
      <div className={cx('boxShadow', styles.searchBox)} style={this.props.style ? this.props.style : {}}>
        <div className={this.state.collapse ? styles.collapse: ''}>
          {this.props.children}
        </div>
        {
          queryList.length < colNum
            ? <span className={styles.positionBtn}>
              {this.props.footer}
            </span>
            : <div className={styles.btnContent}>
              <span className="fright">
                {this.props.footer}
              </span>
            {
              isDisplayBtn && <a className={cx('txtleft', styles.collapseBtn)} onClick={() => this.changeStatus()}>
                {
                  this.state.collapse
                    ? <span>高级搜索<i className="iconfont icon-zhankai mg1l" /></span>
                    : <span>简单搜索<i className="iconfont icon-shouqi mg1l" /></span>
                }
              </a>
            }
          </div>
        }
      </div>
    )
  }
}
