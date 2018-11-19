// React基础组件
import React from 'react'
// dva 连接组件 - 连接route和model
import { connect } from 'dva'
// 引入antd的组件
import { Form, Modal, Button } from 'antd'
//导入路由组件，用于跳转等
import { Link, hashHistory } from 'dva/router'
// 导入项目全局配置文件
import config from 'config/config' 
import ListPage from 'widget/PageTmpl/ListPage'

// 引入model取值工具方法
import { mapStateToProps } from 'utils/view_utils'
// 当前组件样式
import styles from './myPageStyle.less' 

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

  const modalVis = (vis,title=modelObj.title) => {
    // 分发到model文件中effects的xxx方法
    dispatch({
      type: `${namespace}/vis`,
      payload: {
      vis,
      title
    }
    });
  }

  let pageProps = {
    ui: {
     api_url: 'caf/mgmt/items/car/list-by-page', // 接口地址
     method: 'GET', // 接口请求方式
     params: 'pageNum=1&pageSize=10', // 接口默认参数
     mockData: null, // 模拟数据
     search_bar:{ // 查询栏
       fields: [
         {
           en_name: 'carCode', // 字段英文名
           zh_name: '车型编号', // 字段中文名
           elem_type: 'Input', // 页面元素类型
           elem_valid_type: 'string', // 页面元素校验类型，使用antd的校验类型，支持正则表达式
         }
       ],
       searchHandler: () => { // 自定义搜索按钮回调函数，点击搜索时触发
           console.log('search click')
       },
       resetHandler: () => { // 自定义重置按钮回调函数，点击重置时触发
         console.log('reset click')
       },
       searchCallback: params => { // 自定义搜索完成后的后调函数, 搜索完成后触发, 并将本次搜索的参数传入
         console.log('search finish', params)
       },
       pasteTargetList: [  // 列表组件中将输入框的en_name作为默认id(也可以通过id另外设置)
         'carName',  // 将需要粘贴事件拦截的输入框id以数组的形式传入, 该参数对应PasteFromClipboard组件的targetList参数
       ]
     },
     action_bar: [ // 顶部操作栏
       {
         func_name: 'onAdd', // 按钮的函数名称，约定为on开头的驼峰
         label: '新增车型', // 按钮名称
         type: 'primary', // 高亮按钮
         icon: 'plus', // 图标为加号
         onClick: (e, rows) => { // 自定义点击事件，第二个参数rows为当rowSelection: '1'时，返回选中行的数据
             console.log('e:', e, 'rows:', rows)
         }
       },
       {
         func_name: 'onDelete', // 按钮的函数名称，约定为on开头的驼峰
         label: '删除车型', // 按钮名称
         type: 'primary', // 高亮按钮
         icon: 'delete', // 图标为加号
         rowSelection: '1', // 开启表格第一列前面为单选、复选框时，设置此字段
         onClick: (e, rows) => { // 自定义点击事件，第二个参数rows为当rowSelection: '1'时，返回选中行的数据
             console.log('e:', e, 'rows:', rows)
         }
       }
     ],
     // 表格配置项
     table: {
       fields: [ // 表头字段列，兼容antd的其它字段
         {
           en_name: 'code', // 字段英文名
           zh_name: '车型编号', // 字段中文名
         },
         {
           en_name: 'name',
           zh_name: '车型名称',
         },
         {
           en_name: 'propName',
           zh_name: '分类',
         },
         {
           en_name: 'isDirectSale',
           zh_name: '标签',
         },
         {
           en_name: 'itemPrice',
           zh_name: '指导价',
           render: (text, item) => { // 自定义渲染列
                 return <span >{ item.minGuidePrice } </span>
           }
         },
         {
           en_name: 'updatePerson',
           zh_name: '销售状态',
           render: (text) => {
                 return text == 1 ? '在售' : '停售';
           }
         }
       ],
       actions: [ // 表格操作
             {
               func_name: 'onViewOrder',
               label: '查看订单',
               url: '/order/list',
               params: 'id=&status=', // id、status为每一行数据返回的字段，组件会自动获取该行的值附加到请求参数中，支持多层级的取值和附加值
             },
             {
               func_name: 'onDetail',
               label: '查看',
               render: (record) => { // 自定义渲染操作
                 return <Link to = {'/home/modelsManage/modelDetails?id=' + record.id}>查看</Link>;
               }
             },
             {
               func_name: 'onEdit',
               label: '编辑',
               onClick: (e, record) => { // 自定义点击事件
                     console.log('e:', e, 'record:', record)
               }
             },
             {
               func_name: 'onDelete', // 组件内部已对onDelete做了处理(只要传删除的接口地址 api_url)，也可以自定义处理点击
               api_url: '/model/remove',
               method: 'DELETE',
               params: 'id=&user.status', // id为每一行数据返回的字段，组件会自动获取该行的值附加到请求参数中，支持多层级的取值和附加值
               label: '编辑',
               onClick: (e, record) => { // 自定义点击事件
                     console.log('e:', e, 'record:', record)
               }
             },
       ]
     }
   }
}

  
  return (
    <div>
      <a type="primary" onClick={()=>modalVis(true,'标题2')} style={{marginBottom:"50px"}}>打开一个列表框</a>
      <Modal title={modelObj.title} visible={modelObj.vis} onOk={()=>modalVis(false)} onCancel={()=>modalVis(false)}>
        <p>some contents...</p>
        <p>some contents...</p>
        <p>some contents...</p>
      </Modal>
      <ListPage pageProps={pageProps} visible={modelObj.vis} />
    </div>
  );
}

// 连接视图(view)和模型(model)
export default connect(mapStateToProps)(Form.create()(routeView))