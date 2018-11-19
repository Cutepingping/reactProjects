// import './index.html'
import 'babel-polyfill'
import dva from 'dva'
import createLoading from 'dva-loading'
import { hashHistory } from 'dva/router'
import appMod from './widget/Layout/App/AppMod'
import router from './router'

let app = null;

if('loc' !== '' + ENV){
  app = dva(createLoading())
}else{
  // 1. Initialize
  app = dva({
    ...createLoading(),
    history: hashHistory,
    onError (error) {
      console.error('app onError -- ', error)
    },
  })
}

// 2. Model
// app.model(require('./models/app'))
app.model(appMod)
// 3. Router
// app.router()
app.router(router)

// 4. Start
app.start('#root')