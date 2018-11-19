// 把model中的状态映射到view中
const mapStateToProps = function(state){
  if(!!window.CURR_TAB_KEY){
    // 状态的key数组
    let keysArr = Object.keys(state)
    // 当前model的namespace
    let currKey = window.CURR_TAB_KEY
    let currModel = window.ROUTES_TO_MODEL[currKey]
    let currNameSpace = currModel.namespace
    // 注入到view的model对象
    let obj = {}
    // 设置固定的两个属性
    obj.model = {
      modelObj: state[currNameSpace],
      namespace: currNameSpace
    }
    // 返回注入的对象
    return obj
  }else{
    return {}
  }
}

export default { mapStateToProps }