window.editor = null

// 监听父页面传来数据
var onmessage = function (event) {
  var data = event.data;
  var origin = event.origin;
  if(!!window.editor){
    window.editor.html(data.html)
  }
  // console.log('监听到父页面传来：data:', data, 'origin:', origin)
  //do someing
}

if(typeof window.removeEventListener != 'undefined'){
  window.removeEventListener('message', onmessage)
}

if(typeof window.detachEvent != 'undefined'){
  window.detachEvent('message', onmessage)
}

if (typeof window.addEventListener != 'undefined') {
  window.addEventListener('message', onmessage, false)
} else if (typeof window.attachEvent != 'undefined') {
  //for ie
  window.attachEvent('onmessage', onmessage)
}

// 必须这么写才行，按照官方KindEditor.ready就是不行，坑爹的kindEditor
var createKindEditor = function(kEditor){
  var paramsObj = Qs.parse(window.location.hash.substring(1))
  var policy_url = decodeURIComponent(paramsObj.policy_url)
  var auth = decodeURIComponent(paramsObj.auth)
  var group = paramsObj.group

  var customConfig = {
    uploadJson: "http:\/\/www.dtyunx.com",
    allowFileManager: false,
    allowFlashUpload: true,
    allowMediaUpload: true,
    allowFileUpload: false,
    items: KIND_EDITOR_ITEMS_CONFIG,
    // 自定义上传
    customUploadImg: function(files, insert, attachType){
      var file = files[0]
      if(!file) return false
      // file 已选择的文件对象
      // home 文件对象的组名(目录)
      uploadObject2OSS(policy_url, auth, file, group, attachType).then((imgUrl) => {
        // 插入编辑器
        insert(imgUrl)
      }).fail((err) => {
        if('401' === '' + err.status){
          alert('登录信息失效，请重新登录')
        }else{
          try{
            if('[object String]' === '' + Object.prototype.toString.call(err)){
              alert(err || '未知的上传图片异常')
              window.editor.hideDialog()
            }else{
              let errorObj = JSON.parse(err.responseText)
              alert(errorObj.resultMsg || '未知的上传图片异常')
            }
          }catch(e){
            console.error(e)
            alert(e || '未知的上传图片异常')
            window.editor.hideDialog()
          }
        }
      })
    },
    afterCreate: function() {
      let that = this
      that.sync();
    },
    beforeSetHtml: function() {
      // console.log('beforeSetHtml')
      let that = this
      that.sync();
    },
    afterSetHtml: function() {
      console.log('afterSetHtml')
      let that = this
      that.sync();
    },
    afterBlur: function() {
      let that = this
      that.sync();
    },
    // afterChange: function () {
    //  let that = this
    //  // that.sync();
    //  // //富文本输入区域的改变事件，一般用来编写统计字数等判断
    //  // console.log("最多20000个字符,已输入" + that.count() + "个字符");
    // },
  }
  window.editor = KindEditor.create('#editor_id', customConfig)
}

// 创建编辑器
createKindEditor()

// 向父窗体发送当前文档高度
document.body.onload = function() {

  let wch = document.getElementById('wrapContainer').offsetHeight
  console.log('wch:', wch)
  // 向父页面发送数据
  window.parent.postMessage({ scrollHeight: wch - 44, eventType: 'scrollHeight' }, '*')
}

document.getElementById('onOk').addEventListener('click', function() {
  // 向父页面发送数据
  window.parent.postMessage({ html: window.editor.html(), eventType: 'ok' }, '*')
}, false)

document.getElementById('onCancel').addEventListener('click', function() {
  // 向父页面发送数据
  window.parent.postMessage({ html: window.editor.html(), eventType: 'cancel'}, '*')
}, false)