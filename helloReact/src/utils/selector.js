// 删除样式class
const removeClass = function(elem, cls) {
  if (hasClass(elem, cls)) {
    var newClass = ' ' + elem.className.replace(/[\t\r\n]/g, '') + ' ';
    while (newClass.indexOf(' ' + cls + ' ') >= 0) {
      newClass = newClass.replace(' ' + cls + ' ', ' ');
    }
    elem.className = newClass.replace(/^\s+|\s+$/g, '');
    document.body.className = newClass.replace(/^\s+|\s+$/g, '')
  }
}

const hasClass = function(elem, cls) {
  cls = cls || '';
  if (cls.replace(/\s/g, '').length == 0) return false; //当cls没有参数时，返回false
  return new RegExp(' ' + cls + ' ').test(' ' + elem.className + ' ');
}
 
const addClass = function (elem, cls) {
  if (!hasClass(elem, cls)) {
    elem.className = elem.className == '' ? cls : elem.className + ' ' + cls;
  }
}

const addSkinMeta = function(){
  if(!hasClass('skinMeta_1')){
    addClass(document.body, 'skinMeta_1')
  }
}

const removeSkinMeta = function(){
  removeClass(document.body, 'skinMeta_1')
}

export default {removeClass, hasClass, addClass, addSkinMeta, removeSkinMeta}