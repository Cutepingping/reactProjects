/*
 * 产品分类
 *
 * @author 苏离
 * @since 20180621
 */
import React, {PropTypes} from 'react'
import {connect} from 'dva'
import {Button, Form, Popconfirm} from 'antd';
import {isEmpty} from 'lodash'
import cx from 'classnames'
import Detail from './prodCategoryDetail'
import {Category} from '../../widget/Category/Category'
import {mapStateToProps} from '../../utils/view_utils'


const Cat = ({dispatch, model, form}) => {
  //选中类目
  function selectCategory(checkedKeys) {
    form.resetFields();
    const data = originalCategoryList.find(item => item.id + '' === checkedKeys[0]);

    dispatch({
      type: `${namespace}/updateStore`, payload: {
        actionType: 'edit',
        detailData: data || {},
        selectedKeys: checkedKeys
      }
    })
  }

  function create(id) {
    resetFields();
    //更新店铺列表
    dispatch({
      type: `${namespace}/getShopList`
    })
    dispatch({
      type: `${namespace}/updateStore`, payload: {
        actionType: 'add',
        detailData: {
          parentId: id || '0',
          status: 1,
          isFinal: 0
        }
      }
    })
  }

  function deleteItem(id) {
    dispatch({type: `${namespace}/delete`, payload: {id}})
  }

  function sort(id, sort) {
    dispatch({type: `${namespace}/sort`, payload: {catalogId: id, type: sort}})
  }

  function isFinalNode(item) {
    return item.isFinal + '' === '0'
  }

  const {modelObj, namespace} = model;
  const {resetFields} = form;
  const {searchValue, autoExpandParent, detailData, actionType, categoryList, originalCategoryList, expandedKeys,
    btnLoading, selectedKeys, pageConfig} = modelObj;
  const contentHeight = 550
  const categoryProps = {
    categoryList, contentHeight, autoExpandParent, searchValue, expandedKeys, dispatch, nameSpace: namespace,
    originalCategoryList, selectedKeys, create, deleteItem, pageConfig, selectCategory: selectCategory, sort, isFinalNode,
    isSort: true,
    leftSpan: 6,
    rightSpan: 18,
    width: '100%'
  }

  return (
    <Category {...categoryProps}>
      <Detail data={{detailData, actionType, btnLoading, originalCategoryList, namespace}}/>
    </Category>
  );
}

export default connect(mapStateToProps)(Form.create()(Cat))
