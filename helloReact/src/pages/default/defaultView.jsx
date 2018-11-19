// React基础组件
import React from 'react'
// dva 连接组件 - 连接route和model
import { connect } from 'dva'
// 引入antd的组件
import { Form } from 'antd'
//导入路由组件，用于跳转等
import { Link, hashHistory } from 'dva/router'
// 导入项目全局配置文件
import config from 'config/config' 

// 引入model取值工具方法
import { mapStateToProps } from 'utils/view_utils'
// 当前组件样式
import styles from './defaultStyle.less' 

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

  return (
    <div onClick={ e => clickHandler(e) }>Hello DVA!</div>
  )
}

// 连接视图(view)和模型(model)
export default connect(mapStateToProps)(Form.create()(routeView))