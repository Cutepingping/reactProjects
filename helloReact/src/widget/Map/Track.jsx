import React from 'react'
import { Modal, Form } from 'antd'
import styles from './Track.less'

const FormItem = Form.Item;
const {Component} = React
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 7 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 17 },
  },
};

export default class Track extends Component {

  componentDidMount(prevProps, prevState) {
    var map = new AMap.Map("track_map_container", {});
    var truckOptions = {
      map: map,
      policy:0,
      size:1,
    };
    var driving = new AMap.TruckDriving(truckOptions);
    var path = [];
    path = this.props.paths.map(d => {
      return {
        lnglat: d
      }
    })
    driving.search(path,function(status, result) {
      //TODO something
    });
  }

  render(){
    const {location} = this.props

    return <Modal title={this.props.title || '轨迹'} width="800" visible={true} footer={null} onCancel={this.props.onCancel}>
      <div id="track_map_container" style={{width: 500, height: 400,...this.props.style}} className={'iblock'}></div>
      <div className={styles.right}>
        <Form autoComplete="off" className="auto-wrap">
          <FormItem {...formItemLayout} label="起点">
            {location.start}
          </FormItem>
          <FormItem {...formItemLayout} label={location.current ? '当前位置' : '终点' }>
            {location.current || location.end}
          </FormItem>
        </Form>

      </div>
    </Modal>
  }

}

