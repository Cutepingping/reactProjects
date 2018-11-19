export default {
  namespace: 'app',
  state: {
    // 当前页签标题 - 兼容旧的代码
    currTabTitle: ''
  },
  subscriptions: {
    setup({ dispatch }) {},
  },
  effects: {
    // 设置页签标题
    * setTabTitle({ payload }, { call, put, select }) {
      yield put({
        type: 'updateStore',
        payload: {
          currTabTitle: {...payload}
        }
      })
    },
  },
  reducers: {
    updateStore(state, action) {
      return {
        ...state,
        ...action.payload
      }
    },
  },
}
