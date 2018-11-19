/**
 * Created by yang.fan on 2017/9/25.
 */
import React from 'react';
import {Modal} from 'antd';
import styles  from './ImgBoost.less';
const { Component } = React

/*
*
* 图片放大组件
*
*/
export default class extends Component {
  // 构造函数
  constructor(props, context) {
    super(props, context);
    this.state = {

      //浏览器宽
      winWidth: '0',

      //浏览器高
      winHeight: '0',

      //父元素传递需要展示的图片URL   必填
      imgUrl: this.props.imgUrl || null,

      //关闭按钮  必填
      closeCbk: ()=>{
        this.props.closeCbk();
      },
    }

  }

  //计算浏览器的宽高
  findDimensions(){
    let w = '0', h = '0';
    //获取窗口宽度
    if (window.innerWidth)
      w = window.innerWidth;
    else if ((document.body) && (document.body.clientWidth))
      w = document.body.clientWidth;

    //获取窗口高度
    if (window.innerHeight)
      h = window.innerHeight;
    else if ((document.body) && (document.body.clientHeight))
      h = document.body.clientHeight;

    //通过深入Document内部对body进行检测，获取窗口大小
    if (document.documentElement && document.documentElement.clientHeight && document.documentElement.clientWidth)
    {
      h = document.documentElement.clientHeight;
      w = document.documentElement.clientWidth;
    }

    //返回宽和高对象
    return {w, h}
  }

  //弹窗的确定按钮
  handleOk(){
    console.log('确定')
  }

  //弹窗的取消按钮
  handleCancel(){
    // console.log('取消');
    let THIS = this;
    this.setState({imgUrl: null}, ()=>{
      THIS.state.closeCbk();
    });
  }

  render() {
    let THIS = this;

    return (
      <div>
        <Modal
          visible={this.state.imgUrl && '' !== this.state.imgUrl ? true : false}
          title={false}
          onOk={this.handleOk}
          onCancel={this.handleCancel.bind(THIS)}
          width={THIS.state.winWidth/1.5}
          className={styles.modCss}
          style={{ top: 0 }}
          footer={null}
        >
          <div style={{height: THIS.state.winHeight}}>
            <img src={this.state.imgUrl} alt=""/>
          </div>
        </Modal>
      </div>
    )
  }

  //准备：即将被重新渲染，状态未变化
  componentWillUpdate(nextProps, nextState) {
    let THIS = this;

    //浏览器大小改变的时候
    window.onresize = function(){
      //调用获取宽高函数
      let obj = THIS.findDimensions();

      //改变状态
      THIS.setState({winHeight: obj.h,winWidth: obj.w});
    };
  }

  //完成：正在被重新渲染，状态已变化
  componentDidUpdate(prevProps, prevState) {
  }

  // 已加载组件，收到新属性时调用
  componentWillReceiveProps(nextProps) {
    // console.log('nextProps: ',nextProps);
    // this.state.propsParameter.selArea = nextProps.selArea;
    // this.setState({});
    this.setState({imgUrl: nextProps.imgUrl});
  }

  // 插入真实 DOM
  componentDidMount() {
    let THIS = this;
    //调用获取宽高函数
    let obj = THIS.findDimensions();
    //改变状态
    THIS.setState({winHeight: obj.h,winWidth: obj.w});
  }

}

