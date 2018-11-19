// 加载React
import React, { Component } from 'react'
// 引入antd
import { Form, Row, Col } from 'antd'
// 引入lodash
import { get } from 'lodash'

// 当前组件样式
import styles  from './index.less'
// 引入配置信息
import config from '../../config/config'

// 导出组件
class BasicTable extends Component {
  // 构造函数
  constructor(props, context) {
    super(props, context)
    this.state = {
      biz: {
        tableData: {}
      }
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
  async componentWillReceiveProps(nextProps) {
    await this.getTableData()
  }

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
    await this.getTableData()
  }

  // 获取面板数据
  async getTableData(){
    let self = this
    try{

      // 取出父组件传来参数
      let table_data = get(self.props, 'tableProps.ui.table_data', null)

      // 校验参数
      if(!!table_data){
        let biz = self.state.biz
        biz.tableData = table_data
        // 设置到状态机
        self.setState({ biz })
        return false
      }
    }catch(e){
      return e || '未知的请求异常'
    }
  }

  // 一维数组转二维
  one2TwoArray(oneArray, maxCol){
    if (!oneArray || 0 === oneArray.length || !maxCol) return [];
    let k = 0, i = 0, j = 0, b = new Array(), maxRow = Math.ceil(oneArray.length / maxCol);

    // 遍历行
    for (; i < maxRow; i++) {
      b[i] = [];
      j = 0;
      // 遍历列
      for (; j < maxCol; j++) {
        b[i][j] = oneArray[k];
        k++
      }
    }
    return b
  }

  // 初始状态或状态变化会触发render
  render(ReactElement, DOMElement, callback) {
    let fields = get(this.props, 'tableProps.ui.fields', [])
    if(0 === fields.length){
      return ''
    }

    let columns = get(this.props, 'tableProps.ui.columns', 3)

    // 字段列表转为二维数组
    let rowFields = this.one2TwoArray(fields, columns)
    return (
      <div className={`public_listMain ${styles.whiteBg}`}>
        <div className={styles.productMain + ' detailRowMain'}>
          {
            rowFields.map((row, i) => {
              return (
                <Row key={'row_' + i}>
                  {
                    row.map((cell, j) => {
                      if(!!cell){
                        // 判断是否为占位单元格
                        if (get(cell, 'placeholder', false)) {
                          return (
                            <Col className="col" span={24/columns} key={'cell_' + j}>
                              <div className="leftName">&nbsp;</div>
                              <div className="rightCont">&nbsp;</div>
                            </Col>
                          )
                        } else {
                          let cellVal = get(this.state.biz.tableData, `${cell.en_name}`, '')
                          return (
                            <Col className="col" span={24/columns} key={'cell_' + j}>
                              <div className="leftName">{ '' + cell.zh_name }：</div>
                              <div className="rightCont">{ !!cell.render ? cell.render(cellVal): cellVal } &nbsp;</div>
                            </Col>
                          )
                        }
                      }
                    })
                  }
                </Row>
              )
            })
          }
        </div>
      </div>
    )
  }
}

export default Form.create()(BasicTable)
