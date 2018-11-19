import { selector } from '../../utils'

// 给文档body加样式
const bodyClass = function () {
  if(!selector.hasClass('skinProgramme_1')){
    selector.addClass(document.body, 'skinProgramme_1');
  }
}

export default bodyClass