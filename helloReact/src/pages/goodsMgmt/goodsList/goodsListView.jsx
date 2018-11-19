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
          {
            en_name: 'carCode', // 字段英文名
            zh_name: '车型编号', // 字段中文名
            elem_type: 'Input', // 页面元素类型
            elem_valid_type: 'string', // 页面元素校验类型，使用antd的校验类型，支持正则表达式
          },
          {
            en_name: 'carName', 
            zh_name:'车型名称',
            placeholder: '使用逗号做分隔符',
            elem_type: 'Input',
            elem_valid_type: 'string'
          },
          {
            en_name: 'createTime',
            zh_name: '创建时间',
            elem_type: 'Date',
            split_keys: ['createTimeBegin',
              'createTimeEnd'
            ],
            format: 'YYYY-MM-DD',
            elem_valid_type: 'string'
          },
          {
            en_name:'validTime',
            zh_name: '有效时间',
            elem_type: 'Date',
            format: 'YYYY-MM-DD HH:mm:ss',
            double: true,
            split_keys: ['validTimeBegin', 'validTimeEnd'],
            elem_valid_type: 'string'
          },
          {
            en_name: 'catelogId',
            zh_name: '分类',
            elem_type: 'TreeSelect',
            elem_valid_type: 'string',
            cmpt_items: [
              {
                label: '子节点一',
                value: '0-0',
                key: '0-0',
                children: [
                  {
                    label: '子节点一',
                    value: '0-0-1',
                    key: '0-0-1'
                  },
                  {
                    label: '子节点二',
                    value: '0-0-2',
                    key: '0-0-2'
                  }
                ]
              }

            ]
          }
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

  return (
    <div className="boxShadow">
      <div className={styles.title}>商品条目</div>
      <hr/>
      <ListPage pageProps={ pageProps }/>
    </div>
    
  )
  // return <div onClick={ e => clickHandler(e)>列表页</div>
}

// 连接视图(view)和模型(model)
export default connect(mapStateToProps)(Form.create()(routeView))