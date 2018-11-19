import React from 'react'
import _ from 'lodash'

const {authPaths = []} = window.bjfn

let pathSet = new Set(authPaths.map(p => p.path))
let pathAndMethodList = authPaths.map(p => `${p.method}:${p.path}`)
let pathAndMethodSet = new Set(pathAndMethodList)

/*
 * 检测是否有权限
 * @param option {string} 授权路径
 * */
export const checkPermission = (option) => {
  if (_.isString(option)) {
    // method:path | path
    // o(1) 判断，比较快
    if (pathSet.has(option) || pathAndMethodSet.has(option)) {
      return true
    }

    // o(n) 判断，比较慢，建议改成 o(1) 判断
    return _.some(pathAndMethodList, str => str.indexOf(option) > -1)
  } else if (_.isObject(option)) {
    return _.find(authPaths, option)
  } else if (_.isArray(option)) {
    return option.map(opt => checkPermission(opt))
  } else {
    throw new Error('not a valid permission to check')
  }
}

/*
 * 过滤权限树
 * @param authPaths {array} 全部权限
 * @param userAuthPaths {array} 用户拥有授权
 * */
export const authFilter = (authPaths, userAuthPaths) => {
  return _.filter(authPaths, (d) => {
    if (_.includes(userAuthPaths, d.value)) {
      return d
    } else {
      if (d.child) {
        d.child = authFilter(d.child, userAuthPaths)
        if (!_.isEmpty(d.child)) return d
      }
    }
  })
}
