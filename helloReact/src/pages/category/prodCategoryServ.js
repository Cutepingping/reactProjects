/*
 * 产品分类
 *
 * @author 苏离
 * @since 20180621
 */

import {request} from '../../config/request'
import config from '../../config/config'

export async function queryProdCategory(params) {
  return 
  return request({
    url: `http://localhost:8007/src/page/productCategory/response.js`,
    method: 'get',
    data: params,
  }, true)
}

export async function updateProdCategory(params) {
  return request({
    url: `${config.defaultApiHeader}/v1/pearlriver/item/catalog/update`,
    method: 'put',
    data: params,
    headers:{
      'Content-type': 'application/json;charset=UTF-8'
    },
  }, true)
}

export async function addProdCategory(params) {
  return request({
    url: `${config.defaultApiHeader}/v1/pearlriver/item/catalog/save`,
    method: 'post',
    data: params,
    headers:{
      'Content-type': 'application/json;charset=UTF-8'
    },
  }, true)
}

export async function deleteProdCategory(params) {
  return request({
      url: `${config.defaultApiHeader}/v1/pearlriver/item/catalog/delete`,
    method: 'delete',
    data: {
      id: params ? params.join(',') : ''
    },
  }, true)
}

export async function sortProdCategory(params) {
  return request({
    url: `${config.defaultApiHeader}/v1/pearlriver/item/catalog/sort`,
    method: 'put',
    data: params,
  }, true)
}





