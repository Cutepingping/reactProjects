import React, { PropTypes } from 'react'
import { Breadcrumb, Icon } from 'antd'
import { Link } from 'dva/router'
import styles from './Bread.less'
import { menu } from '../../../utils'
import config from '../../../config/config'

let pathSet = [], fullPath = ''
const getPathSet = function (menuArray, parentPath) {
  parentPath = parentPath || ''
  menuArray.forEach(item => {
    fullPath = '/home/' + parentPath + item.key
    pathSet[(fullPath).replace(/\//g, '-').hyphenToHump()] = {
      path: fullPath,
      name: item.name,
      icon: item.icon || '',
      clickable: item.clickable === undefined,
    }
    if (item.child) {
      getPathSet(item.child, `${parentPath}${item.key}/`)
    }
  })
}
getPathSet(menu)

function Bread ({ location, currTabTitle }) {
  let pathNames = []
  location.pathname.substr(1).split('/').forEach((item, key) => {
    if (key > 0) {
      pathNames.push((`${pathNames[key - 1]}-${item}`).hyphenToHump())
    } else {
      pathNames.push((`-${item}`).hyphenToHump())
    }
  })

  const breadsArray = pathNames.filter(item => (item in pathSet))
  const breads = breadsArray.map((item, key) => {
    const content = (
      // <span>{pathSet[item].icon
      //     ? <Icon type={pathSet[item].icon} style={{ marginRight: 4 }} />
      //     : ''}{pathSet[item].name}</span>
      <span>{pathSet[item].name}</span>
    )
    return (
      <Breadcrumb.Item key={key}>
          {content}
      </Breadcrumb.Item>
    )
  })
  //解决当进入左侧菜单中不存在的页面时，面包屑无法显示页面标题的问题
  if(breads && breads.length < 2 && currTabTitle && currTabTitle.title) {
    breads.push((<Breadcrumb.Item key="2">
      <span>{currTabTitle.title} </span>
    </Breadcrumb.Item>))
  }


  return (
    <div className={styles.bread}>
      <Breadcrumb separator=">">
        <Breadcrumb.Item >
          {/*<Link to="/businessmanHome">*/}
            <Icon type="home" />
          <span><Link to="/">{config.sysType === 'entCenter' ? '企业中心': '首页'}</Link></span>
          {/*</Link>*/}
        </Breadcrumb.Item>
        {breads}
      </Breadcrumb>
    </div>
  )
}

Bread.propTypes = {
  location: PropTypes.object,
}

export default Bread
