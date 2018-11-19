/*
 * 弹框多数据选择器
 *
 * @author 啊九
 * @since 2017/12/21
 */
import React from 'react';
import { Modal, Row, Col, Form, TreeSelect, Select, Table, Input, Button, Icon, Checkbox, Popconfirm, message } from 'antd';
import { Link } from "dva/router";
import styles  from './PopUpSelect.less';
import { request } from '../../config/request'
import $ from 'jquery';
import { cloneDeep, get } from 'lodash'
import AdvanceSearch from '../CollapsiblePanels/AdvanceSearch'
import {QueryCondition} from '../Grid/Grid'
import config from '../../config/config'
import cx from 'classnames'

const { Component } = React
const FormItem = Form.Item
const { Option, OptGroup } = Select
const TreeNode = TreeSelect.TreeNode

/*
*
* 产品选择组件
*
*/
export default class extends Component {
  // 构造函数
  constructor(props, context) {
    super(props, context);
    this.state = {
      queryList: cloneDeep(props.queryList),
      //需要传递的参数
      visible: this.props.visible || false,//是否打开
      isSave: this.props.isSave || false,//是否保存已选数据
      onItem: this.props.onItem || false,//更新已选数据
      itemIds:this.props.itemIds || [],
      extendPropName: this.props.extendPropName || 'extendPropName',//属性名称字段
      //组件宽度
      modalWidth: 1000,
      //右侧选择框的高度
      maxHeight: 403,
      //表格数据加载标志
      loadingFlag: true,
      //查询条件
      search: {
        catalogId:"",//前端类目
        groupPropId:"",//扩展属性类型
        tagId:"",//产品标签
        propId:"",//产品属性
        propValueId: '', // 选择子产品属性
        propShow: '', // 产品属性显示
        itemCode:"",//产品编号
        itemName:"",//产品名称
      },
      pageNum: 1,//当前页
      pageSize: 10,//单页条数
      tableData: [],
      total: 0,
      // 已选择的产品
      selectedProduct: [],
      // 右侧已选择产品中选择的行
      selectedRows: [],
      // 右侧已选择产品中选择的行号
      selectedRowKeys: [],
      //关闭按钮  必填
      closeCbk: ()=>{
        this.props.closeCbk();
      },
      // 确认回调
      confirmCbk: (item) => {
        this.props.confirmCbk(item)
      }
    }

  }


  //Modal初始化
  componentWillMount() {
    this.setModalWidth()
    // 还需新增state初始化
  }

  //准备：即将被重新渲染，状态未变化
  componentWillUpdate(nextProps, nextState) {
    let self = this;
    //浏览器大小改变的时候
    window.onresize = function(){
      if (self.state.visible) {
        self.setModalWidth()
      }
    };
  }

  //完成：正在被重新渲染，状态已变化
  componentDidUpdate(prevProps, prevState) {
    // this.getTableHeight()
  }

  // 已加载组件，收到新属性时调用
  componentWillReceiveProps(nextProps) {
    // this.state.propsParameter.selArea = nextProps.selArea;
    // this.setState({});
    this.state.visible = nextProps.visible;
    if(this.state.visible == true){
      if(nextProps.isSave){
        let selectedProduct = cloneDeep(nextProps.onItem).map(item => {
          item.key = item[nextProps.idKey]
          item.itemName = item.name
          return item
        })
        this.setState({
          selectedProduct,
          itemIds: nextProps.itemIds
        })
      }
      this.setState({}, ()=>{
        this.getProductList();
      });
    }
  }

  // 插入真实 DOM
  componentDidMount() {
  }


  //获取产品列表
  async getProductList(){
    let that = this;
    let {respListKey, idKey, defaultReqParams = {}} = this.props;

    this.setState({
      loadingFlag: true,
    })
    let { pageNum, pageSize, search, queryList } = cloneDeep(that.state)
    //组装接口入参
    let params = {};
    queryList.map(item => {
      params[item.key] = item.value;
    });

    let {resultCode, status, resultMsg, data} = await request({
      url: that.props.requestUrl,
      method: 'GET',
      data: {
        ...defaultReqParams,
        pageNum,
        pageSize,
        ...params,
      }
    });
    if (resultCode == 0 && resultMsg) {
      that.getTableHeight();
      data[respListKey].map((item, i) => {
        item.key = item[idKey]
      })

      this.setState({
        tableData: data[respListKey],
        total: data.total,
        loadingFlag: false,
      })
    }
  }

  // 设置Modal宽度
  setModalWidth() {
    let windowWidth = document.body.clientWidth
    let modalWidth = windowWidth * 0.8 > 1200 ? 1200 : windowWidth * 0.8
    this.setState({modalWidth})
  }

  // 设置表格内容
  setTableColumn() {
    let self = this
    let {idKey, isSingle} = this.props;

    return [
      ...this.props.tableColumn,
      {
        title: isSingle ? '操作' : <Link
        onClick={() => self.handleSelectAll()}
        >全选</Link>,
        width: 70,
        render: (item) => {
          let flag = false;
          this.state.selectedProduct.map((x,i)=>{
            if(x[idKey] == item[idKey]){
              flag = true
            }
          })
          if (this.state.itemIds) {
            this.state.itemIds.map((x,i)=>{
              if(x == item[idKey]){
                flag = true
              }
            })
          }
          return (
            <div className="tableAction">
              <Link onClick={() => {this.handleSelect(item)}} disabled={flag}>
                {flag ? '已选择' : '选择'}
              </Link>
            </div>
          )
        }
      }
    ]
  }
  setSelectedColumn() {
    return [
      ...this.props.selectedColumn,
      {
        title: "操作",
        className: styles.del,
        width: 60,
        fixed: 'right',
        render: (item) => {
          return (
            <Popconfirm
              title='确定要删除吗?'
              okText='确定'
              cancelText='取消'
              onConfirm={() => this.deleteRow(item)}
            >
              {/* <Icon onClick={() => this.deleteRow(item)} style={{fontSize: 24}} type="close-circle"/> */}
              <Icon style={{fontSize: 20}} type="close-circle" onClick={() => this.deleteRow(item)} />
            </Popconfirm>
          )
        }
      },
    ]
  }

  //分页发生时所调用的方法
  pageChangeHandler(page, size) {
    this.setState({
      pageNum: page,
      pageSize: size
    }, this.getProductList)
  }

  // 设置分页
  setPagination() {
    return {
      current: parseInt(this.state.pageNum),//当前页
      pageSize: this.state.pageSize,//单页条数
      total: this.state.total,//总条数
      simple:true,
      showTotal: e=>`共 ${this.state.total} 条`,
      showSizeChanger: true,
      showQuickJumper: true,
      onShowSizeChange: (page, size) => {
        this.pageChangeHandler(page, size)
      },
      onChange: (page, size)=>{
        this.pageChangeHandler(page, size)
      }
    }
  }

  //清空组件状态
  clearSearch(cbk) {
    if (!!cbk) {
      this.setState({
        queryList: cloneDeep(this.props.queryList)
      }, cbk)
    } else {
      this.setState({
        queryList: cloneDeep(this.props.queryList)
      })
    }
  }

  //弹窗的确定按钮
  handleConfirm(){
    let that = this
    let obj = cloneDeep(that.state.selectedProduct)
    // let returnData = obj.map(item => {
    //   return {
    //     id: item[idKey],
    //     key: item[idKey],
    //     name: item.itemName
    //   }
    // })
    this.state.confirmCbk(obj)
    if(!this.state.isSave){
      this.setState({
        selectedProduct:[],
      }, this.clearSearch)
    }else{
      this.setState({})
    }

    this.state.closeCbk()
  }

  //弹窗的取消按钮
  handleCancel(){
    let that = this
    this.setState(
      {
        selectedProduct: [],
        pageNum: 1,
        pageSize: 10
      },
      this.clearSearch
    )
    this.state.closeCbk()
  }

  //弹窗的查询按钮
  handleSearch() {
    this.setState({
      pageNum: 1,
      pageSize: 10
    }, () => {
      this.getProductList()
    })
  }

  //弹窗的重置按钮
  handleReset() {
    this.clearSearch(this.getProductList)
  }

  // 列表的选择按钮
  handleSelect(item) {
    let selectedProduct = this.state.selectedProduct;
    let {isSingle} = this.props;
    if(isSingle) {
      selectedProduct = [item]
    }else {
      selectedProduct.push(item)
    }
    this.setState({selectedProduct})
  }

  handleSelectAll() {
    let {idKey} = this.props;
    let {tableData, selectedProduct} = this.state
    tableData.map(item => {
      let flag = false
      for (let i = 0; i < selectedProduct.length; i++) {
        const e = selectedProduct[i];
        if (e[idKey] === item[idKey]) {
          flag = true
          break
        }
      }
      if (!flag) {
        selectedProduct.push(item)
      }
    })
    this.setState({selectedProduct})
  }

  // 右侧已选框中每行的删除
  deleteRow(item) {
    let {idKey} = this.props;
    let selectedProduct = this.state.selectedProduct
    let selectedRows = this.state.selectedRows
    selectedProduct.map((x,i)=>{
      if(item[idKey] == x[idKey]){
        selectedProduct.splice(i,1)
      }
    })

    selectedRows.map((x,i)=>{
      if(item[idKey] == x[idKey]){
        selectedRows.splice(i,1)
      }
    })
    this.setState({selectedProduct, selectedRows})
  }
  // 右侧已选框上的删除按钮
  deleteSelected(type) {
    let {idKey} = this.props;
    let self = this
    if (type == 'all') {
      if(self.state.selectedProduct.length === 0) {
        message.warn('已选列表中至少存在一条数据')
        return
      }
      self.setState({selectedProduct: [], selectedRows: []})
      self.allSelected()
    } else {
      let selectedRows = self.state.selectedRows;
      let selectedProduct = self.state.selectedProduct;
      let cSelectedProduct = [];
      let cSelectedRows = [];
      selectedRows.map((x,i)=>{
        selectedProduct.map((j,y)=>{
          if(x[idKey] == j[idKey]){
            delete selectedProduct[y]
            delete selectedRows[i]
          }
        })
      })

      selectedProduct.map((x,i)=>{
        if(x){
          cSelectedProduct.push(x)
        }
      })

      selectedRows.map((x,i)=>{
        if(x){
          cSelectedRows.push(x)
        }
      })
      this.setState({selectedProduct: cSelectedProduct, selectedRows: cSelectedRows})
    }
  }

  allSelected(flag) {
    let self = this
    if (flag) {
      let {selectedProduct} = self.state
      let allKeys = selectedProduct.map(e => e.key)
      self.setState({selectedRowKeys: allKeys})
    } else {
      self.setState({selectedRowKeys: []})
    }
  }

  //更新状态值
  updateModel(value, name, modHierarchy) {
    if(modHierarchy === 'search') {
      const {queryList} = this.state;
      let data = queryList.find(item => item.key === name);
      data.value = value;
      find(this.state.queryList)
      this.setState({queryList})
    } else {
      let obj = modHierarchy ? this.state[modHierarchy] : this.state;
      obj[name] = value;
      this.setState({...obj})
    }
  };

  //获取左侧表格的高度
  getTableHeight() {
    let that = this
    let tableDom = $('#table')
    setTimeout(() => {
      that.setState({
        maxHeight: tableDom.height()
      })
    }, 100);
  }


  render() {
    let self = this
    return (
      <div>
        <Modal
          title={this.props.title || '选择'}
          visible={this.props.visible}
          onOk={this.handleConfirm.bind(this)}
          onCancel={this.handleCancel.bind(this)}
          width={this.state.modalWidth}
        >
          <Form className="public_listMain">
            <AdvanceSearch footer={
              <span>
                <Button type="primary" htmlType="button" size="large" onClick={this.handleSearch.bind(this)}>搜索</Button>
                <Button  htmlType="button" size="large" onClick={this.handleReset.bind(this)}>重置</Button>
              </span>
            }>
              <QueryCondition
                data={this.state.queryList}
                inputChange={(key, value) => this.updateModel(value, key, 'search')}
              />
            </AdvanceSearch>
          </Form>
          <Row gutter={16}>
            <Col span={16}>
              <div className="boxShadow" id='table'>
                <Row className={styles.emptyTitle}>&nbsp;</Row>
                <Table
                  className={styles.table}
                  columns={this.setTableColumn()}
                  dataSource={this.state.tableData}
                  pagination={this.setPagination()}
                  scroll={{
                    y: 310,
                    ...(this.props.tableScroll || {})
                  }}
                />
              </div>
            </Col>
            <Col span={8}>
              <div className={'boxShadow ' + styles.selected}>
                <Row className={styles.title}>
                  <Col span={12}>
                    {
                      this.state.selectedRows.length !== 0 ?<Popconfirm
                        title='确定要删除吗?'
                        okText='确定'
                        cancelText='取消'
                        onConfirm={() => this.deleteSelected('')}
                      >
                        <Link>
                          批量删除
                        </Link>
                      </Popconfirm> : <Link onClick={e=>{message.warn("至少选择一项")}}>批量删除</Link>
                    }
                  </Col>
                  <Col span={12}>
                    <Popconfirm
                      title='确定要删除吗?'
                      okText='确定'
                      cancelText='取消'
                      onConfirm={() => this.deleteSelected('all')}
                      onCancel={() => self.allSelected()}
                    >
                      <Link onClick={() => self.allSelected(true)} >
                        全部删除
                      </Link>
                    </Popconfirm>
                  </Col>
                </Row>
                <Row className={styles.scroll} style={{maxHeight: this.state.maxHeight}}>
                  <Col>
                    <Table
                      className={cx(styles.textNoWrap, styles.table)}
                      columns={this.setSelectedColumn()}
                      dataSource={this.state.selectedProduct}
                      pagination={false}
                      rowSelection={{
                        selectedRowKeys: self.state.selectedRowKeys,
                        onChange: (selectedRowKeys, selectedRows) => {
                          this.setState({selectedRowKeys, selectedRows})
                        },
                      }}
                      scroll={{
                        y: 310,
                        ...(this.props.selectedTableScroll || {})
                      }}
                    />
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
        </Modal>
      </div>
    )
  }

}
