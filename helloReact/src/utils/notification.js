import { message, notification, Modal } from 'antd';
const confirm = Modal.confirm;

/*
* 请求提示信息
* @param msgObj {obj} msgObj = {
*         title: 'titile'
*         description: 'description'
*       }
*  @param type {string} error/warn/info/success
* */
export function reqInform (msgObj, type = 'success', duration = 3) {
  const msgTypeList = ['info', 'success', 'error', 'warn']
  if(!msgTypeList.includes(type) ){
    type = 'info'
  }

  notification[type]({
    message: msgObj.title,
    description: msgObj.description,
    //icon: <Icon type="smile-circle" style={{ color: '#108ee9' }} />,
    duration
  });
}

/*
 * 提示信息
 * @param msgObj {obj} msgObj = {
 *         title: 'titile'
 *         description: 'description'
 *       }
 *  @param type {string} error/warn/info/success
 * */
export function messageInform (msg, type = 'success', duration = 3) {
  const msgTypeList = ['info', 'success', 'error', 'warn']
  if(!msgTypeList.includes(type) ){
    type = 'info'
  }
  message[type](msg, duration);
}

// 打开确认对话框
export function showConfirm(obj) {
  return new Promise((resolve, reject) => {
    confirm({
      title: obj? obj.title : '登录信息失效提示',
      content: obj? obj.content : '登录信息失效，请重新登录',
      onOk() {
        resolve('1')
      },
      onCancel() {
        resolve('2')
      },
    });
  })
}
