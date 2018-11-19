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
import styles from './goodsDetailStyle.less' 

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
console.log(modelObj);
  return (
    <div className='public_listMain'>
      <div className="boxShadow">
      <div className={styles.content}>
        <div className={styles.ksClear}>
          <div className={styles.topImg} >
            <img src={modelObj.imgUrl01} />
          </div>
          <div className={styles.topContent}> 
            <h3>{modelObj.goodsNamexx}
Nike Air系列运动跑鞋</h3>
            <h2 className={styles.goodsPrice}>
              {modelObj.goodsPricexx}￥ 355.00 - 455.00
            </h2>
            <div className={styles.goodsDetails}> 
              <div className={styles.goodsItems}>
                运费： <span>{modelObj.goodsFare}</span>
              </div>
              <div className={styles.goodsItems}>
                库存： <span>{modelObj.goodsStock}</span>
              </div>
              <div className={styles.goodsItems}>
                颜色： <span>{modelObj.goodsColor}</span>
              </div>
              <div className={styles.goodsItems}>
                鞋码： <span>{modelObj.goodsSize}</span>
              </div>
            </div>
            <p>
              <span>{modelObj.descItemsxxx}质量好</span>
              <span>{modelObj.descItemsxxx}质量好</span>
              <span>{modelObj.descItemsxxx}质量好</span>
            </p>
          </div>
        </div>
        <div className={styles.imgShows}>
          <img src={modelObj.imgurlxx} />
          <img src={modelObj.imgurlxx} />
          <img src={modelObj.imgurlxx} />
        </div>
        <div className={styles.goodsInfo}>
          <div className = {styles.title}><h5>商品详情</h5></div>
          <div className={styles.content}>
            <p>商品描述</p>
            <p>xxxxxxxxxxxxxxxxxxxxxxxxxxxxx</p>
          </div>
        </div>
        <div className={styles.brandInfo}>
          <div className={styles.title}><h5>品牌详情</h5></div>
          <img src={modelObj.imgurlxx} />
        </div>
      </div>
      </div>    
    </div>
  )
}

// 连接视图(view)和模型(model)
export default connect(mapStateToProps)(Form.create()(routeView))