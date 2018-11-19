// 加载React
import React, { Component } from 'react'
// 引入antd
import { Form, Row, Col, Table } from 'antd'
// 引入地址解析库
import { parse } from 'qs'
// 引入lodash
import { get, cloneDeep, merge, includes } from 'lodash'

// 引入异步请求
import { request } from '../../config/request'
// 当前组件样式
import styles  from './index.less'
// 引入配置信息
import config from '../../config/config'

// 表单域
const FormItem = Form.Item
// 表单项布局
const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
}

// 导出组件
class ListTable extends Component {
  // 构造函数
  constructor(props, context) {
    super(props, context)
    this.state = {
      tableData: {
        //表头字段
        columns : [],
        // 表格数据
        dataSource: [],
        // 分页条
        pagination: {
          defaultCurrent: 1,
          defaultPageSize: 10,
          current: 1,
          pageSize: 10,
          total: 0,
          showSizeChanger: true,
          showQuickJumper: true
        }
      }
    }
  }

  //准备：即将被重新渲染，状态未变化
  componentWillMount() {}

  //准备：即将被重新渲染，状态未变化
  componentWillUpdate(nextProps, nextState) {}

  //完成：正在被重新渲染，状态已变化
  componentDidUpdate(prevProps, prevState) {}

  // 已加载组件，收到新属性时调用
  componentWillReceiveProps(nextProps) {}

  //组件将被卸载  
  componentWillUnmount(){ 
    //重写组件的setState方法，直接返回空
    this.setState = (state, callback) => {
      return
    }
  }

  //组件将被卸载  
  componentWillUnmount(){}

  // 已插入真实DOM
  async componentDidMount(){
    await this.getTableDatas()
  }

  // 请求业务系统
  doBizRequest(url, params, method, headers){
    // 返回Promise
    return request({
      url: `${url}`,
      method: `${method || 'GET'}`,
      data: params,
      headers
    })
  }

  //  获取扩展属性
  getExtProps(obj, exKeys){
    let tmpObj = {}, keys = []
    // 键名数组
    keys = Object.keys(obj)

    // 判空
    if(0 === keys.length) return {}
    keys.map((key, i) => {
      // 排除自定义的属性名，返回antd的属性名
      if(!includes(exKeys, key)){
        tmpObj[key] = obj[key]
      }
    })
    return tmpObj
  }

  // 获取表格表头
  getColumnsProps(fields){
    if(!fields || 0 === fields.length) return {}
    let cloneFields = cloneDeep(fields), tmpColumns = [], tmpObj = {}, extObj = {}, exKeys = ['en_name', 'zh_name']
    // 构建表头
    cloneFields.map((field) => {
      // 初始化表头
      tmpObj = {
        title: field.zh_name,
        dataIndex: field.en_name,
        key: field.en_name,
      }
      // 获取antd的扩展属性
      extObj = this.getExtProps(field, exKeys)
      // 合并自定义的属性
      tmpObj = merge(tmpObj, extObj)
      // 放入新构建的表头
      tmpColumns.push(tmpObj)
    })

    let columnsFunc = get(config, 'listConfig.columns', null)
    if(!columnsFunc) return []
    // 返回表头
    return columnsFunc(tmpColumns)
  }

  // 给表格数据列表填充key属性
  fillTableWithKey(tableDataSource){
    if(0 === tableDataSource.length){
      return []
    }
    let copyDs = cloneDeep(tableDataSource)
    copyDs.map((ds, i) => {
      ds.key = i
    })
    return copyDs
  }

  // 获取标准分页信息
  handlerTableData(bizResult, currNo, currSize){
    let self = this
    // 取出结果集中的数据列表
    let dataList = get(bizResult, 'data.list', [])
    // React渲染时，需要为每个数据行添加key属性
    dataList = self.fillTableWithKey(dataList)
    // 分页条
    let pagination = get(self.props, 'tableProps.ui.pagination', null)
    // 若设置了pagination false，则不显示分页条
    if('[object Boolean]' === '' + Object.prototype.toString.call(pagination)){
      return {
        dataSource: dataList,
        pagination: false
      }
    }
    // 临时的数据对象
    let tmpObj = get(self.state, 'tableData', {})
      // 当前页号 - 默认第1页
    let current = currNo || get(bizResult, 'data.pageNum', 1)
    // 每页记录数 - 默认10条每页
    let pageSize = currSize || get(bizResult, 'data.pageSize', 10)
    // 总记录数 - 默认0
    let total = get(bizResult, 'data.total', 0)

    // 设置数据源
    tmpObj.dataSource = dataList
    tmpObj.pagination.current = current
    tmpObj.pagination.pageSize = pageSize
    tmpObj.pagination.total = total

    tmpObj.pagination.showTotal = e => `共 ${total} 条`
    tmpObj.pagination.onChange = (page) => {
      let oldPagination = get(self.state, 'biz.tableData.pagination.pageSize', 10)
      return self.getTableDatas(page, oldPagination)
    }
    tmpObj.pagination.onShowSizeChange = (page, size) => {
      return self.getTableDatas(page, size)
    }

    // 非首次请求，点击翻页时，需要触发状态机

    let biz = get(this.state, 'biz', {})
    biz.tableData = tmpObj
    self.setState({ biz })
    return tmpObj
  }

  // 获取合并后的参数
  getParamsObj(params){
    if(!params) return {}
    let tmpParamsObj = {}
    if('[object String]' === '' + Object.prototype.toString.call(params)){
      if(!!params){
        tmpParamsObj = parse(params)
      }
    }else{
      tmpParamsObj = params
    }
    return tmpParamsObj
  }

  // 处理参数
  handleParams(){
    let self = this
    let api_url = get(self.props, 'tableProps.ui.api_url', '')
    let method = get(self.props, 'tableProps.ui.method', '')
    let params = get(self.props, 'tableProps.ui.params', '')
    let headers = get(self.props, 'tableProps.ui.headers', '')
    return { api_url, method, params, headers }
  }

  // 获取表格数据
  async getTableDatas(currNo, currSize){
    let self = this
    try{

      let { api_url, method, params, headers } = self.handleParams()
      if(!api_url) return false
      // 合并参数
      let tmpParamsObj = self.getParamsObj(params)
      // 如果传入了页码，则覆盖
      if(!!currNo){
        tmpParamsObj.pageNum = currNo
      }
      // 如果传入了每页条数，则覆盖
      if(!!currSize){
        tmpParamsObj.pageSize = currSize
      }
      let bizResult = await self.doBizRequest(api_url, tmpParamsObj, method, headers)

      if('0' === '' + bizResult.resultCode){
        return self.handlerTableData(bizResult, currNo,  currSize)
      }else{
        return null
      }
    }catch(e){
      console.error('e:', e)
      return e || '未知的请求异常'
    }
  }

  // 初始状态或状态变化会触发render
  render(ReactElement, DOMElement, callback) {
    let fields = get(this.props, 'tableProps.ui.fields', [])
    return (
      <div className="public_listMain">
        <Table
          columns={ this.getColumnsProps(fields) }
          dataSource={ this.state.tableData.dataSource }
          pagination={ this.state.tableData.pagination }
        />
      </div>
    )
  }
}

export default Form.create()(ListTable)