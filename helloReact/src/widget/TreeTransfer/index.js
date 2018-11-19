/**
 * Created by a.jiu on 2018/01/15.
 */
import React from 'react';
import { Modal, Row, Col, Form, Tree, Select, Table, Input, Button, Icon, Checkbox } from 'antd';
import { Link } from "dva/router";
import styles  from './index.less';
import { request } from '../../../config/request'
const { Component } = React
import $ from 'jquery';
import { get, cloneDeep, isEmpty, compact, indexOf, difference } from 'lodash'
// 导入全局配置
import config from '../../../config/config'
const TreeNode = Tree.TreeNode;
const FormItem = Form.Item
const { Option, OptGroup } = Select

/**
* 带树形结构的穿梭框组件
* 目前只支持输入数据为一层嵌套, 父级选项下只有一层子选项
* @prop {[Array]} dataSource [树形数据]
* @prop {[String]} childrenKey [树形数据子节点数据的key, 默认为children]
* @prop {[Array]} selectedData [已选择的数据]
* @prop {[String]} notFoundContent [已选框中无数据时显示的文本]
* @prop {[Array]} titles [备选框和已选框顶部的标题]
* @prop {[Function]} dataCbk [数据每次变化均会调用该函数, 输出已选框中的数据]
* @prop {[Boolean]} initFlag [输入参数发生变化时, 组件检查该标志位, 若检测到一个上升沿(false -> true), 则根据输入参数初始化组件状态]
*/

export default class extends Component {
  // 构造函数
  constructor(props, context) {
    super(props, context);
    this.state = {
      //需要传递的参数
      childrenKey: this.props.childrenKey || 'children',
      checkedKeys: [], // 被勾选后 将id放入checkedKeys
      leftCheckedKeys: [], // 被勾选后 将id放入checkedKeys
      rightCheckedKeys: [], // 被勾选后 将id放入checkedKeys
      selectedKeys: [], // 点击箭头后, 将id从checkedKeys移入selectedKeys
      rightDirection: true, // 标识将进行改变的方向, 用于按钮的使能
      leftDirection: true, // 标识将进行改变的方向, 用于按钮的使能
      // 内部数据
      parentId: [],
      childrenSet: {},
      allId: []
    }
  }

  // 输出数据处理
  dataExport = () => {
    // 1.将父级元素剔除
    // 2.按剩下的子级元素id生成输出结果
    let self = this
    let {parentId, childrenSet, selectedKeys} = this.state
    let childrenId = difference(selectedKeys, parentId)
    let result = childrenId.map(e => {
      return childrenSet[e]
    })
    this.props.dataCbk(result)
  }

  // 输入数据处理
  dataInit = () => {
    // 将DataSource中的父级元素id取来放在parentId中
    // 将DataSource中的子级元素取出来放在childrenSet中 {id: {object}} 的形式
    let self = this
    let dataSource = this.props.dataSource
    let parentId = [], childrenSet = {};
    const recursion = (data) => {
      for (let i = 0; i < data.length; i++) {
        const e = data[i];
        if (e.children && !isEmpty(e.children)) {
          parentId.push(e.id)
          recursion(e.children)
        } else if (e.parentId) {
          childrenSet[e.id] = e
        }
      }
    }
    recursion(dataSource)
    let allId = parentId.concat(Object.keys(childrenSet))
    // 遍历props中的selectedData中的id, 在childrenSet中取对应项, 将子级id和父级id都加入selectedKeys,
    // 并对父级id去重
    let selectedKeys = []
    self.props.selectedData.map(e => {
      let child = childrenSet[e.id]
      if (child) {
        selectedKeys.push(child.id)
        selectedKeys.push(child.parentId)
      }
    })
    selectedKeys = Array.from(new Set(selectedKeys))
    this.setState({parentId, childrenSet, allId, selectedKeys})
  }

  //节点递归
  sourceTreeNodeRecursion(data) {
    let self = this
    const key = this.state.childrenKey
    const selectedKeys = this.state.selectedKeys
    return data.map((item) => {
      let children = get(item, key)
      if (children && children.length) {
        // 判断父元素及其所有子元素均未被选中
        let parentSelectFlag = indexOf(selectedKeys, item.id) === -1
        // 子元素中只要有一个返回true , flag就为true
        let flag = parentSelectFlag ? parentSelectFlag : children.some(e => indexOf(selectedKeys, e.id) === -1)
        if (flag) {
          return <TreeNode
            key={item.id}
            title={item.name}
          >
            {self.sourceTreeNodeRecursion(children)}
          </TreeNode>;
        }

      }
      if (indexOf(selectedKeys, item.id) == -1) {
        return <TreeNode
          key={item.id}
          title={item.name}
        />;
      }
    });
  }

  //已选节点递归
  selectedTreeNodeRecursion(data) {
    let self = this
    const key = this.state.childrenKey
    const selectedKeys = this.state.selectedKeys
    return data.map((item) => {
      let children = get(item, key)
      if (children && children.length) {
        // 判断父元素及其所有子元素均未被选中
        let parentSelectFlag = indexOf(selectedKeys, item.id) !== -1
        // 子元素中只要有一个返回true , flag就为true
        let flag = parentSelectFlag ? parentSelectFlag : children.some(e => indexOf(selectedKeys, e.id) !== -1)
        if (flag) {
          return <TreeNode
            key={item.id}
            title={item.name}
          >
            {self.selectedTreeNodeRecursion(children)}
          </TreeNode>;
        }

      }
      if (indexOf(selectedKeys, item.id) !== -1) {
        return <TreeNode
          key={item.id}
          title={item.name}
        />;
      }
    });
  }

  onCheck = (checkedKeys, info, direction) => {
    let self = this
    if (direction === 'right') {
      this.setState({rightCheckedKeys: checkedKeys, leftDirection: false})
    } else {
      this.setState({leftCheckedKeys: checkedKeys, rightDirection: false})
    }
  }

  handleLeft = (all) => {
    let self = this
    if (all === 'all') {
      this.setState({
        selectedKeys: [],
        rightCheckedKeys: [],
        leftDirection: true
      }, self.dataExport)
    } else {
      let {rightCheckedKeys, selectedKeys} = self.state
      selectedKeys = difference(selectedKeys, rightCheckedKeys)
      this.setState({
        selectedKeys,
        rightCheckedKeys: [],
        leftDirection: true
      }, self.dataExport)
    }
  }

  handleRight = (all) => {
    let self = this
    if (all === 'all') {
      let selectedKeys = self.state.allId
      this.setState({
        selectedKeys,
        leftCheckedKeys: [],
        leftDirection: true
      }, self.dataExport)
    } else {
      let {leftCheckedKeys, selectedKeys} = self.state
      selectedKeys = selectedKeys.concat(leftCheckedKeys)
      this.setState({
        selectedKeys,
        leftCheckedKeys: [],
        rightDirection: true,
      }, self.dataExport)
    }
  }
  render() {
    let self = this
    let tree = compact(this.sourceTreeNodeRecursion(self.props.dataSource))
    let selectedTree = compact(this.selectedTreeNodeRecursion(self.props.dataSource))
    return (
      <div className={styles.treeTransferContainer +  " boxShadow"}>
        <div className={styles.transferList}>
          <div className={styles.transferHeader}>
              {this.props.titles[0]}
          </div>
          <div className={styles.transferBody}>
            <Tree
              showLine
              onCheck={(checkedKeys, info) => self.onCheck(checkedKeys, info, 'left')}
              checkable
              checkedKeys={self.state.leftCheckedKeys}
            >
              {tree}
            </Tree>
          </div>
        </div>
        <div className={styles.transferOperation}>
          <Button
            type="primary"
            onClick={self.handleLeft}
            disabled={isEmpty(self.state.rightCheckedKeys)}
          >
            <Icon type="left" />
          </Button>
          <Button
            type="primary"
            onClick={self.handleRight}
            disabled={isEmpty(self.state.leftCheckedKeys)}
          >
            <Icon type="right" />
          </Button>
          <Button
            type="primary"
            onClick={() => self.handleLeft('all')}
            disabled={selectedTree.length === 0}
          >
            <Icon type="double-left" />
          </Button>
          <Button
            type="primary"
            onClick={() => self.handleRight('all')}
            disabled={tree.length === 0}
          >
            <Icon type="double-right" />
          </Button>
        </div>
        <div className={styles.transferList}>
          <div className={styles.transferHeader}>
            {this.props.titles[1]}
          </div>
          <div className={styles.transferBody}>
            {
              isEmpty(selectedTree) ? <div className={styles.notFound} >
                {this.props.notFoundContent}
              </div> : <Tree
                showLine
                onCheck={(checkedKeys, info) => self.onCheck(checkedKeys, info, 'right')}
                checkable
                checkedKeys={self.state.rightCheckedKeys}
              >
                {selectedTree}
              </Tree>
            }
          </div>
        </div>
      </div>
    )
  }

  //Modal初始化
  componentWillMount() {
    // 还需新增state初始化
    this.dataInit()
  }

  //准备：即将被重新渲染，状态未变化
  componentWillUpdate(nextProps, nextState) {
  }

  //完成：正在被重新渲染，状态已变化
  componentDidUpdate(prevProps, prevState) {
  }

  // 已加载组件，收到新属性时调用
  componentWillReceiveProps(nextProps) {
    let self = this
    // 检测initFlag由false变为true时, 根据props更新组件内状态
    if (!self.props.initFlag && nextProps.initFlag) {
      let {childrenSet} = self.state
      let selectedKeys = []
      nextProps.selectedData.map(e => {
        let child = childrenSet[e.id]
        selectedKeys.push(child.id)
        selectedKeys.push(child.parentId)
      })
      selectedKeys = Array.from(new Set(selectedKeys))
      self.setState({selectedKeys})
    }
  }

  // 插入真实 DOM
  componentDidMount() {
  }

}
