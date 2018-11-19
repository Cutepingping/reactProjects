// React基础组件
import React from 'react'
// dva 连接组件 - 连接route和model
import { connect } from 'dva'
// 引入antd的组件
import { Form } from 'antd'
// 引入列表页组件
import ListPage from 'widget/PageTmpl/ListPage'
// 引入model取值工具方法
import { mapStateToProps } from 'utils/view_utils'
// 当前组件样式
import styles from './goodsListStyle.less'
// 引入模拟数据
import mockData  from './goodsListMock.js'

/**
 * description 路由视图及事件处理
 * dispatch 分发到models中的effects对应事件名
 * model 用于获取models中state定义的数据
 * form 表单对象
 */
const routeView = function({dispatch, model, form}) {
  // 表单的子函数
  const {resetFields, getFieldDecorator, validateFields, setFieldsValue} = form
  // 取出model对象，命名空间
  const { modelObj, namespace } = model

  // modelObj.xxx获取model中状态机的值

  // 点击处理事件
  const clickHandler = (e) => {
    // 分发到model文件中effects的xxx方法
    dispatch({
      type: `${namespace}/xxx`,
      payload: {}
    });
  }

  let pageProps = {
    // ---------- 界面部分 ----------
    ui: {
      // 页面接口地址
      api_url: "",
      // 接口方式
      method: "GET",
      // 接口参数
      params: "pageNum=1&pageSize=10",
      // 模拟数据 - 用于开发需要，若填充了上面的api_url之后，请将此项设置为null
      mockData: mockData,
      // 查询栏
      search_bar: {
        fields: [
        ]
      },
      // 操作栏
      action_bar: [
       
      ],
      // 数据表格
      table: {
        // 表头字段列表
        fields: [
        ],
        // 表格操作
        actions: [
        ]
      }
    }
  }

  // 用于同步列表的值到父组件
  if(!!modelObj.biz){
    pageProps.biz = modelObj.biz
    pageProps.biz.syncBackCbf = (biz) => {
      dispatch({
        type: `${namespace}/setFormVal`,
        payload: biz
      })
    }
  }

  return <ListPage pageProps={ pageProps }/>
  // return <div onClick={ e => clickHandler(e)>列表页</div>
}

// 连接视图(view)和模型(model)
export default connect(mapStateToProps)(Form.create()(routeView))