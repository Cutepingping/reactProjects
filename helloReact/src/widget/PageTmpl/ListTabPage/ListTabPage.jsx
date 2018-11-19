// React基础组件
import React, { Component } from 'react'
// dva 连接组件 - 连接route和model
import { connect } from 'dva'
// 选项卡、表格、弹出确认框
import { Form, Tabs, Table, Pagination, Popconfirm, Input, Select, Tree, TreeSelect, Radio, Row, Col, Checkbox, Button,
  DatePicker, TimePicker , Modal, Upload, Icon, message, Tag, Cascader } from 'antd'
// 单选按钮组
const RadioGroup = Radio.Group
// 复选按钮组
const CheckboxGroup = Checkbox.Group
// 下拉选项
const Option = Select.Option
// 下拉分组
const OptGroup = Select.OptGroup
// 获取样式类名
import cx from 'classnames'
// 表单域
const FormItem = Form.Item
// 判断对象是否为空
import { isEmpty, isArray, cloneDeep, filter, merge, get, includes, has, pick } from 'lodash'
// 日期处理对象
import moment from 'moment'
// 日期格式
const dateFormat = 'YYYY-MM-DD'
// 时间格式
const dateTime = 'HH:mm:ss'
// 单页应用链接
import { Link } from 'dva/router'
// 树目录
const TreeNode = Tree.TreeNode
// 选项卡面板
const { TabPane } = Tabs
// 日期组件
const { MonthPicker, RangePicker } = DatePicker
// 地址栏解析
import qs from 'qs'
// 对象字符串互转
import { stringify }  from 'qs'
// 富文本编辑器
import { Editor } from '../../Editor'
// 列表配置
import { listConfig } from '../../../config/config'
// 引入异步请求
import { request } from '../../../config/request'
// 引入当前页样式
import styles from './index.less'
// 引入路由对象
import { hashHistory } from 'dva/router'
// 键盘上下移排序
import TableMove from '../../tableMove'

class ListPage extends Component{
  // 构造函数
  constructor(props, context) {
    super(props, context)
    this.state = {
      // 地址栏参数
      query: '',
      // ---------- 界面部分 ----------
      ui: {
        // 查询栏
        search_bar: {},
        // 列表表格
        table: [],
        // 操作栏
        action_bar: []
      },

      // --------- 业务部分 ----------
      biz: {
        // 当前选项卡键值
        currTabKey: '0',
        // 当前选中行
        currRow: '',

        // 复选框选中行数据
        selectedRows: [],
        // 复选框选中行的键
        selectedRowKeys: [],
        // 表格移动对象
        move: {},
        // 角标数组
        badgeList: [],
        // 查询表单
        queryForm: props.pageProps.defaultQueryForm || {},
        // 列表数据
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
  }

  //准备：即将被重新渲染，状态未变化
  componentWillUpdate(nextProps, nextState) {}

  //完成：正在被重新渲染，状态已变化
  componentDidUpdate(prevProps, prevState) {}

  // 已加载组件，收到新属性时调用
  componentWillReceiveProps(nextProps) {
    let oldBiz = get(this.state, 'biz', null)
    let newBiz = get(nextProps, 'pageProps.biz', null)
    let currBiz = merge(oldBiz, newBiz)
    // 获取配置信息
    let { actions, fields } = this.getCfgData(null, nextProps)
    // 重新设置表头
    currBiz.tableData.columns = this.getListColumns(fields, actions)
    console.log('Receive')
    // 同步回状态机
    this.setState({ biz: currBiz })
  }

  //组件将被卸载
  componentWillUnmount(){
    //重写组件的setState方法，直接返回空
    this.setState = (state, callback)=>{
      return;
    };
  }

  // 获取链接URL
  getLinkUrl(record, linkObj){
    let linkUrl = '', linkParams = {}, tmpObj = {}

    // 参数转为对象
    if(!!linkObj.params){
      linkParams = qs.parse(linkObj.params)
    }

    let tmpVal = ''
    // 参数合并
    if(!isEmpty(linkParams)){
      Object.keys(linkParams).map((key, i) => {
        tmpVal = get(record, '' + key,  null)
        if(!!tmpVal){
          tmpObj[key] = tmpVal
        }else{
          tmpObj[key] = linkParams[key]
        }
      })
    }

    // 拼接成完整的URL
    if(!isEmpty(tmpObj)){
      linkUrl = `${linkObj.url}?${qs.stringify(tmpObj)}`
    }else{
      linkUrl = linkObj.url
    }
    return linkUrl
  }

  // 跳转URL
  goURL(e, url){
    // 作用域提升
    let self = this

    if(!!e){
      // 阻止冒泡
      e.preventDefault()
      e.nativeEvent.stopImmediatePropagation()
    }

    // 清空表单
    this.props.form.resetFields()
    // 跳转到新的路由
    hashHistory.push(url)
    return false
  }

  // 删除点击
  async onDelete(e, item, urlObj){
    // 作用域提升
    let self = this, tmpObj = urlObj.params

    // 字符串转对象
    if("[object String]" === "" + Object.prototype.toString.call(urlObj.params)){
      tmpObj = qs.parse(urlObj.params)
    }

    let tmpVal = ''
    // 附加动态参数
    if(!isEmpty(tmpObj)){
      Object.keys(tmpObj).map((tKey, i) => {
        tmpVal = get(item, '' + tKey, null)
        if(!!tmpVal){
          tmpObj[tKey] = tmpVal
        }
      })
    }
    // 删除结果
    let result = await self.doBizRequest(urlObj.api_url, tmpObj || {}, urlObj.method || 'GET')

    // 删除成功，重新加载数据
    if('0' === '' + result.resultCode){
      message.success('操作成功')
      self.getListDatas()
    }else{
      // message.error(result.resultMsg || '未知的删除记录异常')
    }
  }

  // 新增按钮点击
  onButtonClick(e, url){
    // 作用域提升
    let self = this
    // 跳转URL
    self.goURL(e, url)
  }

  // 查询表单设值
  setSearchModel(qFieldName, val, split_keys){
    let self = this, { biz } = self.state

    // 分割的键值
    if(!!split_keys && split_keys.length > 0){
      split_keys.map((k, i) => {
        biz.queryForm[k] = val[i]
      })
    }else{
      biz.queryForm[qFieldName] = val
    }

    let syncBackCbf = get(self.props.pageProps, 'biz.syncBackCbf', null)
    // 设置到状态机，并同步到父组件
    self.setState({ biz }, () => {
      if(!!syncBackCbf){
        syncBackCbf(biz)
      }
    })
  }

  // 查询记录
  onSearch(e){
    let self =  this
    e.preventDefault()
    self.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        self.getListDatas()
      }
    });
  }

  // 重置查询条件
  onReset(e, isKeepDefault){
    e && e.preventDefault()
    // 清空form
    this.props.form.resetFields()
    let biz = this.state.biz
    if(isKeepDefault) {
      biz.queryForm = get(this.props, 'pageProps.defaultQueryForm', {} );
    } else {
      biz.queryForm = {}
    }

    // 清空状态机
    this.setState({ biz })
  }

  // 删除记录
  onRemove(item){
    e.preventDefault()
  }

  // 展示表格条件 - 避免重复渲染
  showTable(){
    let cLen = get(this.state.biz, 'tableData.columns.length', 0)
    let dLen = get(this.state.biz, 'tableData.dataSource.length', 0)
    return cLen > 0 && dLen > 0
  }

  // 请求业务系统
  doBizRequest(url, params, method, headers){
    // 返回Promise
    return request({
      url: `${url}`,
      method: `${method || 'GET'}`,
      data: params
    })
  }

  // 获取链接数组
  getListLinks(record, links){
    // 作用域提升
    let self = this
    // 链接列表
    let linkDomArr = []
    //  临时链接
    let tmpLink = null

    if(isArray(links) && links.length > 0){
      links.map((link, i) => {
        tmpLink = self.getLinkUrl(record, link)

        if('onDelete' == '' + link.func_name){
          linkDomArr.push(
            <Popconfirm key={'link1_' + i} Collapse title='确定要删除吗？' okText='确定' cancelText='取消' onConfirm={(e) => {self.onDelete(e, record, link)}}>
              <Link >删除</Link>
            </Popconfirm>
          )
        }else{
          if(has(link, 'onClick')){
            linkDomArr.push(<a key={'link1_' + i} href='javascript:;' onClick={ e => link.onClick(e, record) }>{link.label}</a>)
          }else if(has(link, 'render')){
            linkDomArr.push(React.cloneElement(link.render(record), {key: 'link1_' + i}))
          }else{
            linkDomArr.push(<Link key={'link1_' + i} to={tmpLink}>{link.label}</Link>)
          }
        }
        // linkDomArr.push(<Link key={'link1_' + i} to={tmpLink}>{link.label}</Link>)
        linkDomArr.push(<span key={'link2_' + i} className={cx("ant-divider")}/>)
      })
    }
    return linkDomArr
  }

  // 列表页面操作
  getListActions(actions){
    // 作用域提升
    let self = this

    // 操作栏对象
    return {
      title: "操作",
      width: 170,
      fixed: "right",
      render: (text, record, index) => {
        // 以下jsx语法
        return (
          <div className="tableAction">
            { self.getListLinks(record, actions) }
          </div>
        )
      }
    }
  }

  // 获取列表页面表头
  getListColumns(fields, actions){
    // 作用域提升
    let self = this
    // 表头字段数组
    let list_columns = []
    // 空值判断
    if(!fields || 0 === fields.length) return []
    // 临时字段对象
    let tmpFieldObj = null, pickObj = {},  exKeys = ['en_name', 'zh_name']
    // 遍历列表字段
    fields.map((lFiels, i) => {
      tmpFieldObj = {
        title: lFiels.zh_name || '',
        dataIndex: lFiels.en_name || '',
        key: lFiels.en_name || ''
      }

      Object.keys(lFiels).map((key, j) => {
        if(!includes(exKeys, key)){
          tmpFieldObj[key] = lFiels[key]
        }
      })

      if(!!lFiels.is_link){
        tmpFieldObj.render = (text, record, index) => {
          if(!!record.url){
            return <Link to={record.url}>{ text }</Link>
          }else{
            return <span>{text}</span>
          }
        }
      }
      list_columns.push(tmpFieldObj)
    })

    if(actions.length > 0){
      // 附加操作链接
      list_columns.push(self.getListActions(actions))
    }

    // 返回表头
    return list_columns
  }

  // 获取组件项内容
  getCmptItemsObj(bizResult){
    let cmptDatas = [], cmptItemsObj = {}, searchBarFields = get(this.props.pageProps, 'ui.search_bar.fields', [])

    if(!bizResult || '0' !== '' + bizResult.resultCode){
      return cmptItemsObj
    }

    if(searchBarFields.length > 0){
      searchBarFields.map((qField, i) => {
        if(!!qField.cmpt_field_name){
          // 取出组件项内容
          cmptDatas = get(bizResult, `data.${qField.cmpt_field_name}`, [])
          cmptItemsObj[qField.cmpt_field_name] = cmptDatas
        }
      })
    }
    return cmptItemsObj
  }

  // 补充表格数组
  fillTableItems(tableItems){
    if(0 === tableItems.length) return []
    // 数组的情况，则需要遍历，填充后面的元素
    if(tableItems.length > 1){
      let tmpItems = {}, copyTableItems = cloneDeep(tableItems), cArr = ['actions', 'fields', 'move']
      // 遍历表格配置
      copyTableItems.map((cItem, i) => {
        if(0 === i){
          tmpItems = cItem
        }else{
          // 拷贝第一个元素的值到后面的元素
          cArr.map((cKey, j) => {
            if(!has(cItem, cKey)){
              cItem[cKey] = tmpItems[cKey]
            }
          })
        }
      })
      return copyTableItems
    }else{
      return tableItems
    }
  }

  // 获取黄色角标内容
  getBadgeNum(tableItems, bizResult){
    if(!bizResult || '0' !== '' + bizResult.resultCode){
      return []
    }

    if(!isArray(tableItems)){
      return []
    }

    if(0 === tableItems.length){
      return []
    }

    let badgeList = []

    tableItems.map((tItem, i) => {
      if(has(tItem, 'badge_field_name')){
        // 取出角标内容
        badgeList.push({
          badge_field_name: get(bizResult, `data.${tItem.badge_field_name}`, '')
        })
      }
    })
    return badgeList
  }

  // 获取页面需要的字段、链接、表格配置
  getCfgData(currKey, currProps){
    let self = this
    let tmpProps = !currProps? self.props.pageProps: currProps.pageProps
    // 表格配置
    let tableItems = get(tmpProps, 'ui.table', []), actions = [], fields = [], move = {}, statusParams = '', statusParamsObj = {}
    let scroll = {};

    let tIdx = !!currKey? currKey: self.state.biz.currTabKey

    // 若是数组，则取出对应索引号的自己的字段和操作
    if(isArray(tableItems)){
      // 填充表格配置
      tableItems = self.fillTableItems(tableItems)
      statusParams = get(tableItems, `[${tIdx}].status_params`, [])
      statusParamsObj = qs.parse(statusParams)

      actions = get(tableItems, `[${tIdx}].actions`, [])
      fields = get(tableItems, `[${tIdx}].fields`, [])
      move = get(tableItems, `[${tIdx}].move`, [])

      scroll = get(tableItems, `[${tIdx}].scroll`, null)

      // 若是对象，则直接取出
    }else{
      actions = get(tableItems, 'actions', [])
      fields = get(tableItems, 'fields', [])
      move = get(tableItems, 'move', {})
      scroll = get(tableItems, 'scroll', null)
    }

    return { tableItems, actions, fields, move, statusParamsObj, tIdx, scroll }
  }

  // 获取列表数据，是否设置列表
  async getListDatas(isColumns, currNo, currSize, currKey){
    // 作用域提升
    let self = this

    try{
      // 请求参数
      let { url, method, params, headers, mockData } = self.getReqParams(currKey)
      // 获取配置信息
      let { tableItems, actions, fields, move, statusParams, statusParamsObj , tIdx, scroll } = self.getCfgData(currKey, null)
      // 业务表格数据
      let { biz } = self.state
      // 新的数据
      let newBiz = get(self.props.pageProps, 'biz', null)
      biz = merge(biz, newBiz)

      // 查询条件
      let queryForm = biz.queryForm
      // 默认等于页面中的查询条件
      let queryParams = queryForm || {}
      // 传过来的参数合并属性上用户输入的值
      if(!!params){
        queryParams = merge(qs.parse(params), queryForm)
      }

      // 合并状态参数到params对象中
      if(!isEmpty(statusParamsObj)){
        if(queryParams.costType) {
          statusParamsObj.costTypes = queryParams.costType;
        }
        queryParams = merge(queryParams, statusParamsObj)
      }

      // 如果传入了页码，则覆盖
      if(!!currNo){
        queryParams.pageNum = currNo
      }
      // 如果传入了每页条数，则覆盖
      if(!!currSize){
        queryParams.pageSize = currSize
      }

      // 克隆的参数
      let cloneParams = cloneDeep(queryParams)
      // 遍历所有的值
      Object.keys(cloneParams).map((qKey, i) => {
        // 如果是数组，则变成逗号分割的字符串
        if('[object Array]' === '' + Object.prototype.toString.call(cloneParams[qKey])){
          cloneParams[qKey] = cloneParams[qKey].join(',')
        }
      })

      // 业务数据查询
      let bizResult = null
      if(!!mockData){
        bizResult = mockData
      }else{
        bizResult = await self.doBizRequest(url, cloneParams, method, headers)
      }

      //防止表头错乱
      biz.tableData.dataSource = [];
      this.setState({
        biz
      })

      // 业务数据列表
      let dataList =  get(bizResult, 'data.list', []) || []

      // 当前页号 - 默认第1页
      let current = get(bizResult, 'data.pageNum', 1)
      // 每页记录数 - 默认10条每页
      let pageSize = get(bizResult, 'data.pageSize', 10)
      // 总记录数 - 默认0
      let total = get(bizResult, 'data.total', 0)

      // React渲染时，需要为每个数据行添加key属性
      if(0 !== dataList.length){
        dataList.map((item, i) => {
          item.key = ++i
        })
      }

      // 设置表格数据
      biz.tableData.dataSource = dataList || []
      biz.tableData.pagination.current = current
      biz.tableData.pagination.pageSize = pageSize
      biz.tableData.pagination.total = total
      biz.tableData.pagination.showTotal = e => `共 ${total} 条`
      biz.tableData.scroll = scroll;

      biz.currTabKey = tIdx
      biz.move = move

      biz.tableData.pagination.onChange = (page) => {
        self.getListDatas(false, page)
      }
      biz.tableData.pagination.onShowSizeChange = (page, size) => {
        self.getListDatas(false, page, size)
      }

      // 获取表头字段 - 并设置到状态机
      if(!!isColumns){
        biz.tableData.columns = self.getListColumns(fields, actions)
      }

      // 获取查询栏 - 组件内容项
      let cmptItemsObj = self.getCmptItemsObj(bizResult)
      if(!isEmpty(cmptItemsObj)){
        biz = merge(biz, cmptItemsObj)
      }

      // 设置角标数组
      let badgeList = self.getBadgeNum(tableItems, bizResult)
      if(0 !== badgeList.length){
        biz.badgeList = badgeList
      }

      // 拉数据时清空掉选中的复选框
      biz.selectedRows = []
      biz.selectedRowKeys = []
      // 列表刷新方法注册
      biz.refreshListDatas = (page) => {
        self.getListDatas()
      }
      // 清空查询条件
      biz.clearSearchConds = () => {
        self.onReset()
      }

      // 设置到状态机，并同步到父组件
      // self.setState({ biz })
      console.log('get list datas')
      let syncBackCbf = get(self.props.pageProps, 'biz.syncBackCbf', null)
      // 设置到状态机，并同步到父组件
      self.setState({ biz }, () => {
        if(!!syncBackCbf){
          syncBackCbf(biz)
        }
      })

    }catch(e){
      message.error(e || '未知的请求异常')
    }
  }

  // 获取请求参数
  getReqParams(currKey){
    let self = this
    // 页面属性
    let pageProps = self.props.pageProps;
    const currTabKey = currKey || get(self, 'state.biz.currTabKey', '0');

    // 页面接口地址
    let url = get(pageProps, `ui.table[${currTabKey}].url`, '');
    let method = get(pageProps, 'ui.method', 'GET')
    let params = get(pageProps, 'ui.params', {})
    let headers = get(pageProps, 'ui.headers', { 'Content-type': 'application/x-www-form-urlencoded' })
    let mockData = get(pageProps, 'ui.mockData', null)
    // 返回请求参数
    return { url, method, params, headers, mockData }
  }

  // 已插入真实DOM
  async componentDidMount() {
    let self = this
    self.getListDatas(true)
  }

  // 获取下拉框、复选框列表
  getBoxList(qField){
    let items = [], self = this

    // 若设置了内容项，则直接取内容项
    if(!!qField.cmpt_items){
      items = qField.cmpt_items
    }

    // 若设置了结果集中的内容字段
    if(!!qField.cmpt_field_name){
      items = get(self.state.biz, `${qField.cmpt_field_name}`, [])
    }

    return items
  }

  //  获取扩展属性
  getExtProps(obj, exKeys){
    let tmpObj = {}, keys = []
    // 键名数组
    keys = Object.keys(obj)

    if(keys.length > 0){
      keys.map((key, i) => {
        // 排除自定义的属性名，返回antd的属性名
        if(!includes(exKeys, key)){
          tmpObj[key] = obj[key]
        }
      })
    }
    return tmpObj
  }

  // 搜索栏组件的扩展属性
  getSearchBarProps(qField){
    let exKeys = ['en_name', 'zh_name', 'elem_type', 'elem_valid_type', 'cmpt_items', 'cmpt_field_name', 'split_keys', 'format']
    return this.getExtProps(qField, exKeys)
  }

  // 操作栏的扩展属性
  getActionBarProps(actObj){
    let exKeys = ['func_name', 'url', 'label']
    return this.getExtProps(actObj, exKeys)
  }

  // 渲染子组件
  renderChildren(){
    let self = this
    return <div> { self.props.children } </div>
  }

  // 设置当前选项卡
  setCurrTabKey(currKey){
    this.onReset(null, true);
    this.getListDatas(null, null, null, currKey)
  }

  // 获取选中行的值
  getSortVal(record){
    let sortFieldName = get(this.state, 'biz.move.sort_field_name', '')
    let tmpVal = get(record, '' + sortFieldName, '')
    return tmpVal
  }

  // 选中行
  selectRow(record){
    let { biz } = this.state, tmpVal = this.getSortVal(record)
    if('' + biz.currRow !== '' + tmpVal){
      biz.currRow = '' + tmpVal
    }else{
      biz.currRow = ''
    }
    this.setState({ biz })
  }

  // 获取选中行的样式
  getRowClassName(record){
    let tmpVal = this.getSortVal(record)
    if(!tmpVal){
      return ''
    }
    return '' + tmpVal === '' + this.state.biz.currRow ? 'tableTrOn' : ''
  }

  // 表格上下移动处理
  async onTableMove(code){
    let self  = this
    if(!this.state.biz.currRow){
      console.warn('请选中行再操作')
      return false
    }
    let move = get(this.state, 'biz.move', {})
    if(isEmpty(move)){
      console.warn('表格的move属性未设置')
      return false
    }

    let { api_url, params = {}, method = 'GET', headers = {} } = get(move, `${code}`)
    if(!api_url){
      console.warn('表格上下移动的接口未配置')
      return false
    }

    let paramsObj = {}
    if(!!params){
      paramsObj = qs.parse(params)
    }

    // 返回已选中那一行的数据
    let dataSource = get(this.state, 'biz.tableData.dataSource', []), rowData = [], tmpVal = '', currVal
    if(dataSource.length > 0){
      rowData = dataSource.filter((item, idx) => {
        currVal = self.getSortVal(item)
        return '' + currVal === '' + get(self.state, 'biz.currRow', null)
      })
    }

    // 填充键值
    if(0 !== rowData.length){
      Object.keys(paramsObj).map((key, i) => {
        tmpVal = get(rowData, `[0].${key}`, '')
        if(!!tmpVal){
          paramsObj[key] = tmpVal
        }
      })
    }

    let moveResult = await this.doBizRequest(api_url, paramsObj, method, headers)
    if('0' !== '' + moveResult.resultCode){
      message.error(moveResult.resultMsg || '未知的移动表格异常')
      return false
    }

    if('0' === '' + moveResult.resultCode){
      message.success('操作成功')
      this.getListDatas()
    }
  }

  // 获取表格扩展属性
  getTableExtProps(){
    if(this.getRowSelectionCount() > 0){
      return {
        rowSelection: this.getRowSelection()
      }
    }else{
      return {}
    }
  }

  // 获取操作栏rowSelection的个数
  getRowSelectionCount(){
    // 操作栏
    let action_bar = get(this.props, 'pageProps.ui.action_bar', []), rowSelectionCount = 0
    // 遍历操作栏，如果有rowSelection属性，则返回有复选框
    action_bar.map((act, i) => {
      if(has(act, 'rowSelection')){
        rowSelectionCount ++
      }
    })
    return rowSelectionCount
  }

  // 表格复选框选择属性 - onSelect onSelectAll底层都是基于onChange实现
  getRowSelection(){
    let self = this
    let { biz } = self.state
    return {
      selectedRowKeys: get(biz, 'selectedRowKeys', []),
      onChange: (selectedRowKeys, selectedRows) => {
        biz.selectedRows = selectedRows
        biz.selectedRowKeys = selectedRowKeys
        biz.refreshListDatas = (page) => {
          // console.log('page:', page)
          self.getListDatas()
        }
        self.setState({ biz })
      },
      onSelect: (record, selected, selectedRows) => {},
      onSelectAll: (selected, selectedRows, changeRows) => {}
    }
  }

  // 表格滚动扩展属性
  getTableScrollProps(){
    let tmpPageSize = get(this.state.biz, 'tableData.pagination.pageSize', 10)
    let cloneScroll = get(this.state.biz, 'tableData.scroll', {})
    if(tmpPageSize >= 20){
      if(!!cloneScroll){
        cloneScroll.y = 653
      }
    }
    return cloneScroll
  }

  // 初始状态或状态变化会触发render
  render(ReactElement, DOMElement, callback) {
    console.log('list page render')
    // 操作栏
    let action_bar = get(this.props, 'pageProps.ui.action_bar', [])
    // 查询栏字段
    let searchBarFields = get(this.props, 'pageProps.ui.search_bar.fields', [])
    // 查询栏操作
    let searchBarActions = get(this.props, 'pageProps.ui.search_bar.actions', [])
    // 表格列表配置项
    let tableBarItems = get(this.props, 'pageProps.ui.table', [])
    //页面类型 searchBarInTab, searchBarOutTab, list
    let pageType = get(this.props, 'pageProps.ui.pageType', [])
    // 表单校验器
    const { getFieldDecorator } = this.props.form
    //单前tab的key
    let currTabKey = get(this.state, 'biz.currTabKey', '0')
    // 移动属性
    let move = get(this.state, 'biz.move', {})
    let queryForm = get(this.state,'biz.queryForm', {})

    return (
      <div className="public_listMain">
        {/*功能按钮区域*/}
        {
          action_bar.length > 0 && (
            <div className="functionButton">
              {
                action_bar.map((act, i) => {
                  let tmpKey = `action_bar_${i}`
                  if(!!act.render){
                    return React.cloneElement(act.render(), {key: '' + tmpKey})
                  }else{
                    return <Button key={'act_' + i} type={act.type} icon={act.icon}  {...this.getActionBarProps(act)}>{act.label}</Button>
                  }
                })
              }
            </div>
          )
        }

        {/*内容区域*/}
        <div className="boxShadow">
          {
            isArray(tableBarItems) && (
              <Tabs tabPosition="buttom" activeKey={ this.state.biz.currTabKey } onChange={ e => this.setCurrTabKey(e) } type='card'>
                {
                  tableBarItems.map((tbi, i) => {
                    let badgeVal = get(this.state.biz, `badgeList[${i}].badge_field_name`, '')
                    return <TabPane tab={has(tbi, 'badge_field_name')? <span className="badge">{tbi.status_text}<span>{ badgeVal }</span></span> : tbi.status_text} key={`${i}`}></TabPane>
                  })
                }
              </Tabs>
            )
          }
          {/*
           this.showTable() && <Table columns={this.state.biz.tableData.columns} scroll={listConfig.tableScroll} dataSource={this.state.biz.tableData.dataSource} pagination={this.state.biz.tableData.pagination}/>
           */}
          {/*查询条件区域*/}
          {
            pageType === 'searchBarInTab' && searchBarFields[currTabKey].length > 0 && (
              <div className="boxShadow listSearchBox">
                <Form onSubmit={ e => { this.onSearch(e) }}>
                  <Row>
                    {
                      searchBarFields[currTabKey].map((qField, i) => {
                        // 文本输入框
                        if('Input' === '' + qField.elem_type){
                          return (
                            <Col {...listConfig.searchCol} key={'qField_' + i}>
                              <FormItem {...listConfig.searchFormItem} label={qField.zh_name}>
                                <Input value={queryForm[qField.en_name]} placeholder={'请输入' + qField.zh_name} {...this.getSearchBarProps(qField)} onChange={ e => this.setSearchModel(qField.en_name, e.target.value) }/>
                              </FormItem>
                            </Col>
                          )

                          // 下拉框
                        }else if('Select' === '' + qField.elem_type){
                          return (
                            <Col {...listConfig.searchCol} key={'qField_' + i}>
                              <FormItem {...listConfig.searchFormItem} label={qField.zh_name}>
                                <Input type='hidden'/>
                                <Select value={queryForm[qField.en_name]}  placeholder={'请选择' + qField.zh_name } onChange={ e => this.setSearchModel(qField.en_name, e) } {...this.getSearchBarProps(qField)}>
                                  {
                                    this.getBoxList(qField).map((item, j) => {
                                      return <Option key={`${qField.en_name}_${j}`} value={'' + item.value}>{item.label}</Option>
                                    })
                                  }
                                </Select>
                              </FormItem>
                            </Col>
                          )

                          // 复选框
                        }else if('Checkbox' === '' + qField.elem_type){
                          return (
                            <Col {...listConfig.searchCol} key={'qField_' + i}>
                              <FormItem {...listConfig.searchFormItem} label={qField.zh_name}>
                                <CheckboxGroup options={ this.getBoxList(qField) } {...this.getSearchBarProps(qField)} onChange={ e => this.setSearchModel(qField.en_name, e) } />
                              </FormItem>
                            </Col>
                          )

                          // 日期框
                        }else if('Date' === '' + qField.elem_type){

                          let dateVal = get(this.state.biz, `queryForm[${qField.en_name}]`, null)
                          let cloneDateVal = [], tmpDate = null
                          let format = get(qField, 'format', 'YYYY/MM/DD')
                          if(dateVal && dateVal.length > 0){
                            dateVal.map((d, i) => {
                              if(d){
                                tmpDate = moment(d, format)
                              }
                              cloneDateVal.push(tmpDate)
                            })
                          }
                          return (
                            <Col {...listConfig.searchCol} key={'qField_' + i}>
                              <FormItem {...listConfig.searchFormItem} label={qField.zh_name}>
                                <RangePicker style={{width:"100%"}}
                                  {...this.getSearchBarProps(qField)}
                                  allowClear={false}
                                  ranges={{ '今天': [moment(), moment()], '这个月': [moment(), moment().endOf('month')] }}
                                  format= {get(qField, 'format', 'YYYY/MM/DD')}
                                  onChange={ (value, dateString ) => { this.setSearchModel(qField.en_name, dateString, qField.split_keys) } }
                                />
                              </FormItem>
                            </Col>
                          )

                          // 下拉树目录
                        }else if('TreeSelect' === '' + qField.elem_type){
                          return (
                            <Col {...listConfig.searchCol} key={'qField_' + i}>
                              <FormItem {...listConfig.searchFormItem} label={qField.zh_name}>
                                <TreeSelect
                                  style={{ width: "100%" }}
                                  dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                                  treeData={ this.getBoxList(qField) }
                                  placeholder="请选择"
                                  treeDefaultExpandAll
                                  onChange={ e => this.setSearchModel(qField.en_name, e) }
                                />
                              </FormItem>
                            </Col>
                          )

                          // 下拉框分组
                        }else if('GroupSelect' === '' + qField.elem_type){
                          return (
                            <Col {...listConfig.searchCol} key={'qField_' + i}>
                              <FormItem {...listConfig.searchFormItem} label={qField.zh_name}>
                                <Select
                                  style={{ width: '100%' }}
                                  onChange={ e => this.setSearchModel(qField.en_name, e) }
                                >
                                  {
                                    this.getBoxList(qField).map((item, j) => {
                                      return (
                                        <OptGroup key={`opt_group_${qField.en_name}_${j}`} label={item.label} value={item.value}>
                                          {
                                            item.children && item.children.map((iChild, k) => {
                                              return <Option key={`opt_option_${qField.en_name}_${k}`} value={iChild.value}> { iChild.label } </Option>
                                            })
                                          }
                                        </OptGroup>
                                      )
                                    })
                                  }
                                </Select>
                              </FormItem>
                            </Col>
                          )

                          // 级联组件
                        }else if('Cascader' === '' + qField.elem_type){
                          return (
                            <Col {...listConfig.searchCol} key={'qField_' + i}>
                              <FormItem {...listConfig.searchFormItem} label={qField.zh_name}>
                                <Cascader
                                  style={{ width: '100%' }}
                                  options={ this.getBoxList(qField) }
                                  placeholder="请选择"
                                  onChange={ e => this.setSearchModel(qField.en_name, e) }
                                />
                              </FormItem>
                            </Col>
                          )

                          // 数字范围组件
                        }else if('NumberRange' === '' + qField.elem_type){
                          return (
                            <Col {...listConfig.searchCol} key={'qField_' + i}>
                              <FormItem {...listConfig.searchFormItem} label={qField.zh_name}>
                                <div>
                                  <Input {...this.getSearchBarProps(qField)} onChange={ e => this.setSearchModel(get(qField, 'split_keys[0]', qField.en_name), e.target.value) } className={styles.inputRange}/>
                                  <span> ~ </span>
                                  <Input {...this.getSearchBarProps(qField)} onChange={ e => this.setSearchModel(get(qField, 'split_keys[1]', qField.en_name), e.target.value) } className={styles.inputRange}/>
                                </div>
                              </FormItem>
                            </Col>
                          )
                        }
                      })
                    }

                    {/* 子组件渲染 */}
                    { this.renderChildren() }

                    {/*
                     <div> { this.props.children } </div>
                     */}
                    <Col {...listConfig.searchCol} >
                      <Button type="primary" htmlType="submit">搜索</Button>
                      <Button type="default" htmlType="button" onClick={ e => this.onReset(e) }>重置</Button>
                      {
                        searchBarActions.map((sba, i) => {
                          let tmpKey = `search_act_${i}`
                          if(!!sba.render){
                            return React.cloneElement(sba.render(), {key: tmpKey})
                          }else{
                            return <a key={tmpKey} href='javascript:;' onClick={e => { sba.onClick(e, this.biz.selectedRows) }} className={styles.mg2r}>{ sba.label }</a>
                          }
                        })
                      }
                    </Col>
                  </Row>

                </Form>
              </div>
            ) // end searchBarFields length loop
          }
          <Table
            columns={this.state.biz.tableData.columns}
            scroll={{...this.getTableScrollProps()}}
            dataSource={this.state.biz.tableData.dataSource}
            pagination={this.state.biz.tableData.pagination}
            onRowClick={ (record, index) => this.selectRow(record) }
            rowClassName={ (record, index) => this.getRowClassName(record) }
            {...this.getTableExtProps()}
          />
        </div>
        {
          !isEmpty(move) && <TableMove cb={ (keyCode) => { this.onTableMove(keyCode) } }/>
        }
      </div>
    )
  }
}


class SearchBar extends Component{
  // 构造函数
  constructor(props, context) {
    super(props, context)
    this.state = {
    }
  }

  //准备：即将被重新渲染，状态未变化
  componentWillMount() {
  }

  // 已加载组件，收到新属性时调用
  componentWillReceiveProps(nextProps) {

  }

  // 已插入真实DOM
  componentDidMount() {
  }

  // 渲染函数
  render(ReactElement, DOMElement, callback) {
    return React.cloneElement(this.props.children)
  }
}

ListPage.SearchBar = SearchBar

export default Form.create()(ListPage)
