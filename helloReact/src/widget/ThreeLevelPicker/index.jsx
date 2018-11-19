// 加载React
import React from 'react'
// 加载Component
import { Component } from 'react'

import { Select } from 'antd'
const Option = Select.Option
import { get } from 'lodash'

// 导出组件
export default class extends Component {
  // 构造函数
  constructor(props, context) {
    super(props, context)
    this.state = {
      style: {
        'width': '90px',
        'margin': '0 8px 0 0'
      },
      selectProps: {
        node_field: 'title', // 节点字段名
        node_id_field: 'value', // 节点ID字段名
        node_pid_field: 'parent_value', // 节点父ID字段名

        // 3种提供渲染数据方式

        // 方式1: 直接传入方式 - 初步封装方式，开发者需实现获取数据逻辑，封装度低
        cmpt_items: [
          { value: '001', title: '广东'},
          { value: '002', title: '广西'},
          { value: '003', title: '海南'},
          { value: '001001', title: '广州', parent_value: '001'},
          { value: '001002', title: '深圳', parent_value: '001'},
          { value: '001003', title: '珠海', parent_value: '001'},
          { value: '002001', title: '南宁', parent_value: '002'},
          { value: '002002', title: '柳州', parent_value: '002'},
          { value: '002003', title: '桂林', parent_value: '002'},
          { value: '001001001', title: '天河', parent_value: '001001'},
          { value: '001001002', title: '越秀', parent_value: '001001'},
          { value: '001001003', title: '海珠', parent_value: '001001'},
          { value: '001002001', title: '福田', parent_value: '001002'},
          { value: '001002002', title: '罗湖', parent_value: '001002'},
          { value: '001002003', title: '南山', parent_value: '001002'},
          { value: '002001001', title: '安吉', parent_value: '002001'},
          { value: '002001002', title: '朝阳', parent_value: '002001'},
          { value: '002001003', title: '邕宁', parent_value: '002001'}
        ],

        // 方式2: 以api接口描述方式 - 深层次封装方式，开发者无需实现获取数据逻辑，封装适中
        api_url: '',
        api_params: '',
        api_method: '',
        api_headers: {},

        // 方式3: 以组件ID方式 - 高级封装方式，开发者不仅无需实现获取数据逻辑，且界面高度灵活配置，用户可根据需要自己配置
        cmpt_id: ''
      },
      // 第一下拉项选中的值
      firstSelectedVal: '',

      // 第二下拉项数据
      secondItems: [],
      // 第二下拉项选中的值
      secondSelectedVal: '',

      // 第三下拉项数据
      thirdItems: [],
      // 第三下拉项选中的值
      thirdSelectedVal: ''
    }
  }

  //准备：即将被重新渲染，状态未变化
  componentWillMount() {
  }

  //准备：即将被重新渲染，状态未变化
  componentWillUpdate(nextProps, nextState) {}

  //完成：正在被重新渲染，状态已变化
  componentDidUpdate(prevProps, prevState) {}

  // 已加载组件，收到新属性时调用
  componentWillReceiveProps(nextProps) {}

  // 已插入真实DOM
  componentDidMount() {}

  //组件将被卸载  
  componentWillUnmount(){}

  // 获取第N级数据
  getItemsByPid(pidVal){
    let tmpPidVal = null, newItems = [], selectProps = get(this.props, 'selectProps', this.state.selectProps), cmpt_items = get(selectProps, 'cmpt_items', [])
    if(0 === cmpt_items.length) return []
  
    cmpt_items.map((sp, idx) => {
      tmpPidVal = get(sp, `[${selectProps.node_pid_field}]`, null)
      if(!tmpPidVal && !pidVal){
        newItems.push(sp)
      }else{
        if(!!pidVal && '' + tmpPidVal === '' + pidVal){
          newItems.push(sp)
        }
      }
    })
    return newItems
  }

  // 下拉框选择触发
  handleChange(value, level = 1){
    if('1' === '' + level){
      let secondItems = this.getItemsByPid(value)
      this.setState({ firstSelectedVal: value, secondItems, secondSelectedVal: '',  thirdSelectedVal: '', thirdItems: [] })

    }else if('2' === '' + level){
      let thirdItems = this.getItemsByPid(value)
      this.setState({ secondSelectedVal: value, thirdItems, thirdSelectedVal: '' })

    }else if('3' === '' + level){
      this.setState({ thirdSelectedVal: value })
    }
  }

  renderSelect(level = 1){
    let selectItems = [], selectedVal = '', style = get(this.props, 'style', this.state.style), selectProps = get(this.props, 'selectProps', this.state.selectProps)

    if('1' === '' + level){
      selectItems = this.getItemsByPid(null)
      selectedVal = this.state.firstSelectedVal
    }else if('2' === '' + level){
      selectItems =  this.state.secondItems
      selectedVal = this.state.secondSelectedVal
    }else if('3' === '' + level){
      selectItems = this.state.thirdItems
      selectedVal =  this.state.thirdSelectedVal
    }

    return (
      <Select
        showSearch
        style={ style } 
        value={ selectedVal }
        placeholder='请选择'
        onChange={ (val) => { this.handleChange(val, level) } }
        filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
        >
        {
          selectItems.length > 0 && selectItems.map((itemObj, i) => {
            let tmpVal = get(itemObj, `[${selectProps.node_id_field}]`, ''), tmpLabel = get(itemObj, `[${selectProps.node_field}]`, '')
            return <Option key={`item_${level}_${i}`} value={tmpVal}>{tmpLabel}</Option>
          })
        }
      </Select>
    ) 
  }

  // 初始状态或状态变化会触发render
  render(ReactElement, DOMElement, callback) {
    return (
      <div>
        { this.renderSelect(1) }
        { this.renderSelect(2) }
        { this.renderSelect(3) }
      </div>
    )
  }
}