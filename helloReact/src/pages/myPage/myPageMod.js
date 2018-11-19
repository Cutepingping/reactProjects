// 引入接口文件
import { getMember } from './myPageServ.js'

// 对象和JSON字符串互转
import { parse } from 'qs'
// 弹出消息框
import { message } from 'antd'
// 日期处理对象
import moment from 'moment'
/* isEmpty 对象是否为空
 * isArray 对象是否数组
 * cloneDeep 对象深拷贝
 */
import {isEmpty, isArray, cloneDeep, merge} from 'lodash'
// 引入路由对象
import { hashHistory } from 'dva/router'

// 初始默认状态
const defultState = {
  xxx: '1',
  vis:  false,
  title: '标题1'
}

// 声明module
const tmpModule = {
  namespace: 'myPageMod',
  // 默认状态
  state: cloneDeep(defultState),
  // 入口函数(先执行)
  subscriptions: {
    setup ({dispatch, history}) {
      history.listen(({ pathname, query }) => {
        // 页面路由匹配时执行
        if('' + tmpModule.pathname === '' + pathname){
          // 执行业务操作
          dispatch({
            type: 'queryInfo',
            payload: {}
          }) // end dispatch
        } // end if
      }) // end listen
    },
  },

  // 方法列表
  effects: {
    // 查询记录
    *queryInfo({ payload }, { put, call, select }) {
      try{
        // 中断往下执行，以下是示例代码，代码生成后去掉 return false可继续执行
        console.log('this is default')
        // 获取当前组件状态机中的数据，也可以获取其他组件的状态机数据，只要他们被创建过
        return false;
        let tmpState = yield select(state => state[tmpModule.namespace])
        //调用接口，并传参
        const { data , resultCode , resultMsg } = yield call(getMember, parse({ vis: tmpState }))
        //调完接口，将返回的数据存入到状态机
        yield put({ // 调用reducers中方法，把新数据与状态机数据合并更新
          type: 'updateStore', // 方法名，也可以调用effects中的方法
          payload:{
          
          }
        })
      }catch(e){
        console.error(e)
      }
    },
    //查询记录
    *vis({ payload:{vis,title} }, { put, call, select }) {
      try{
        yield put({ // 调用reducers中方法，把新数据与状态机数据合并更新
          type: 'updateStore', // 方法名，也可以调用effects中的方法
          payload:{
            vis,
            title
          }
        })
      }catch(e){
        console.error(e)
      }
    },
  }, 

  // 存入状态机
  reducers: {
    updateStore(preState, action) {
      return Object.assign({}, preState, action.payload)
    }
  }
}

export default tmpModule
