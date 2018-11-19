// 引入React库
import React, {Component} from 'react';
import { Row, Col } from 'antd';

// 显示多个样式类名
import cx from 'classnames';
// 引入组件样式
import styles from './DataRick.less';
import { Form, DatePicker ,Button } from 'antd';
import moment from 'moment';

/*
*  2017.11.8
 */

class DataRick extends Component{
  constructor(props, context) {
    super(props, context)
    this.state = {
      startValue: null,
      endValue: null,
      beginValue:[],
      overValue:null,
      allValue: [],
      endOpen: false,
      defaultValue:null
    };
  }
  disabledStartDate = (startValue) => {
    const endValue = this.state.endValue;
    if (!startValue || !endValue) {
      return false;
    }
    return startValue.valueOf() > endValue.valueOf();
  }

  disabledEndDate = (endValue) => {
    const startValue = this.state.startValue;
    if (!endValue || !startValue) {
      return false;
    }
    return endValue.valueOf() <= startValue.valueOf();
  }

  onChange = (field, value) => {
    this.setState({
      [field]: value,
    });
  }

  onStartChange = ( value ,e) => {
    this.onChange('startValue', value);
    if(this.state.endValue === null){
      this.onChange('endValue', value);
      this.setState({
        beginValue: e,
        defaultValue:moment(e, 'YYYY/MM/DD'),
        overValue:e
      });
    }
    else{
      this.setState({
        beginValue: e,
      });
    }
  }

  onEndChange = (value,e) => {
    this.onChange('endValue', value);
    // console.log(e);
    this.setState({
      overValue: e,
    });
  }

  handleStartOpenChange = (open) => {
    if (!open) {
      this.setState({ endOpen: true });
    }
    var arr1 = [];
    var arr2 = this.state.beginValue;
    var arr3 = this.state.overValue;
    arr1.push(arr2,arr3);
    // console.log(arr1);
    this.props.onChange(null, arr1);
  }

  handleEndOpenChange = (open) => {
    this.setState({
      endOpen: open,
    });
      var arr1 = [];
      var arr2 = this.state.beginValue;
      var arr3 = this.state.overValue;
      arr1.push(arr2,arr3);
      this.props.onChange(null, arr1);
  };
  render(){
    const { startValue, endValue, endOpen } = this.state;
    return (
      <div className={styles.datediv+' '+styles.clf}>
        <Row>
          <Col span={15}>
            <DatePicker
              disabledDate={this.disabledStartDate}
              showTime
              format={this.props.format}
              ranges={this.props.ranges}
              value={startValue}
              placeholder="开始时间"
              onChange={this.onStartChange}
              onOpenChange={this.handleStartOpenChange}
            />
          </Col>
          <Col span={9}>
            <DatePicker
              disabledDate={this.disabledEndDate}
              showTime
              format={this.props.format}
              ranges={this.props.ranges}
              value={endValue}
              placeholder="结束时间"
              onChange={this.onEndChange}
              open={endOpen}
              onOpenChange={this.handleEndOpenChange}
            />
          </Col>
        </Row>
        {/*<div  className={styles.beginTime}>*/}

        {/*</div>*/}
          {/*<span className={styles.moddle}>～</span>*/}
        {/*<div   className={styles.endinTime}>*/}

        {/*</div>*/}
        {/*<Button type="primary" onClick={this.state.onChange}>确定</Button>*/}
      </div>
    )
  }

}
export default DataRick
