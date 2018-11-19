/**
 * @(#)prodCategoryMod.js 0.5.1 2018-01-10
 * Copyright (c) 2017, YUNXI. All rights reserved.
 * YUNXI PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 */
import {
  queryProdCategory,
  updateProdCategory,
  addProdCategory,
  deleteProdCategory,
  sortProdCategory
} from './prodCategoryServ'
import {isEmpty, cloneDeep, pick, omit, difference, filter, get} from 'lodash'
import {message} from 'antd'
import {convertToTree, treeDataConvertor} from '../../utils/util'
import respData from './response'


/*
 * 产品分类
 *
 * @author 苏离
 * @since 20180621
 */
const state = {
  /******   start 使用category组件必须包含state  ******************/
  pageConfig: {
    current: 1,
    size: 50,
    total: 1,
  },
  categoryList: [],
  searchValue: '',
  expandedKeys: ['0'],
  autoExpandParent: true,
  //选中类目
  selectedKeys: [],
  originalCategoryList: [],
  /******   end 使用category组件必须包含state  ******************/
  detailData: {},
  //新增,删除,查询
  actionType: '',
  btnLoading: false,
};

//默认第一层
const topCategory = {
  name: '产品分类',
  pId: '0',
  id: '0',
}

function search(list, searchValue) {
  //检测是否包含searchValue
  function check(list = []) {
    const length = get(list, 'length', 0);
    for(let i = 0; i< length; i++ ) {
      let name = get(list[i], 'name', '');
      if(name.includes(searchValue)) {
        return true;
      } else {
        if(check(list[i].children)) return true;
      }
    }
    return false;
  }

  const copyList = cloneDeep(list);
  const result = [];
  copyList.forEach(d => {
    if(d.name.includes(searchValue) || check(d.children))  result.push(d);
  })
  return result;
}

function getParentKey(name, tree) {
  let parentKey;
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (node.children) {
      if (node.children.some(item => item.name === name)) {
        parentKey = node.id;
      } else if (getParentKey(name, node.children)) {
        parentKey = getParentKey(name, node.children);
      }
    }
  }
  return parentKey;
};

const mod = {
  state: cloneDeep(state),
  subscriptions: {
    setup({dispatch, history}) {
      history.listen(location => {
        if(mod.pathname === '' + location.pathname){
          dispatch({type: 'updateStore', payload: cloneDeep(state)});
          dispatch({type: 'init'});
          dispatch({type: 'getCategory'});
        }
      })
    },
  },
  effects: {
    *init({ payload = {} }, { call, put, select }) {
    },
    //删除
    *delete({ payload = {}}, {call, put, select}) {
      yield put({type: 'updateStore', payload: {btnLoading: true}});
      const resp = yield call(deleteProdCategory, [payload.id]);
      if (resp.resultCode === 0) {
        yield put({type: 'getCategory'});
        message.success('删除成功！');
        yield put({type: 'updateStore', payload: {detailData: {}}});
      }
      yield put({type: 'updateStore', payload: {btnLoading: false}});
    },
    //排序
    *sort({payload}, {call, put, select}) {
      const {detailData} = yield select(d => d[mod.namespace]);
      yield put({type: 'updateStore', payload: {btnLoading: true}});
      const resp = yield call(sortProdCategory, payload);
      if (resp.resultCode === 0) {
        yield put({type: 'getCategory', payload: {
          autoExpand: false
        }});
        message.success('排序成功！');
        yield put({type: 'updateStore', payload: {detailData: {}}});
      }
      yield put({type: 'updateStore', payload: {btnLoading: false}});
    },
    *update({payload}, {call, put, select}) {
      const {detailData, actionType} = yield select(d => d[mod.namespace]);
      yield put({type: 'updateStore', payload: {btnLoading: true}});
      const service = actionType === 'edit' ? updateProdCategory : addProdCategory;
      const resp = yield call(service, {...omit(detailData, ['key', 'children'])});
      if (resp.resultCode === 0) {
        message.success('保存成功!');
        yield put({type: 'updateStore', payload: {detailData: {}, selectedKeys: []}});
        yield put({type: 'getCategory'});
        payload();
      }
      yield put({type: 'updateStore', payload: {btnLoading: false}});
    },
    //获取分类(使用category组件必须包含的effect)
    *getCategory({isReExpand}, {put, call, select}) {
      //数据转义
      function getOrginCategory(data){
        function iterator(d, result) {
          d.forEach((item) => {
            result.push(item.node);
            if(!isEmpty(item.children)) {
              iterator(item.children, result)
            }
          })
        }
        let result = [];
        iterator(data, result);
        return result;
      }
      let resp = yield call(queryProdCategory, { status: -1});
      //todo: 使用mock数据
      resp = respData;
      const {pageConfig} = yield select(d => d[mod.namespace]);
      let topCategoryCopy = cloneDeep(topCategory);
      let categoryList = [topCategoryCopy];

      if (resp.resultCode === 0) {
        if (isEmpty(resp.data)) {
          yield put({
            type: 'updateStore',
            payload: {categoryList}
          });
        } else {
          let convertedData = treeDataConvertor(resp.data, 'node');
	        pageConfig.current == 0 && (pageConfig.current = 1);
          //分页
          const start = (pageConfig.current - 1) * pageConfig.size;
          topCategoryCopy.children = convertedData.slice(start, start + pageConfig.size)
          pageConfig.total = convertedData ? convertedData.length : 1
          yield put({
            type: 'updateStore',
            payload: {
              categoryList,
              originalCategoryList: getOrginCategory(resp.data),
              totalCategoryList: convertedData,
              pageConfig:{...pageConfig}
            }
          })
 	        yield put({
            type: 'pageChange',
            payload: {
              page: pageConfig.current,
              isReExpand
            }
          })
        }
      }
    },
    //跳页(使用category组件必须包含的effect)
    *pageChange({payload}, {put, call, select}){
      const {page, isReExpand} = payload;
      const {pageConfig, totalCategoryList = [], searchValue, originalCategoryList, expandedKeys} = yield select(d => d[mod.namespace]);
      pageConfig.current = page;
      const start = (page - 1) * pageConfig.size;
      let topCategoryCopy = cloneDeep(topCategory);
      let categoryList = [topCategoryCopy];
      pageConfig.current = page;

      //搜索
      let searchedCateList = cloneDeep(totalCategoryList);
      let total = 0;
      let searchedExpKeys = ['0']
      let sv = ''
      if((payload.searchValue == 0 || payload.searchValue) || (searchValue == 0 || searchValue)) {
        sv = payload.searchValue === undefined ? searchValue : payload.searchValue;
        if(searchedCateList) {
          searchedCateList = search(searchedCateList, sv);
          isEmpty(searchedCateList) || (topCategoryCopy.children = searchedCateList.slice(start, start + pageConfig.size))
          total = searchedCateList.length;
        }
        if(!isEmpty(sv)) {
          searchedExpKeys = originalCategoryList.map((item) => {
            if (item.name.includes(sv)) {
              return getParentKey(item.name, categoryList);
            }
            return null;
          }).filter((item, i, self) => item && self.indexOf(item) === i);
        }
      } else {
        isEmpty(searchedCateList) || (topCategoryCopy.children = searchedCateList.slice(start, start + pageConfig.size))
      }

      yield put({
        type: 'updateStore',
        payload: {
          categoryList,
          expandedKeys: isReExpand ? searchedExpKeys : expandedKeys,
          detailData: {},
          selectedKeys: [],
          autoExpandParent: true,
          pageConfig: {
            ...cloneDeep(pageConfig),
            total,
            current: total ? pageConfig.current : 0
          },
          searchValue: sv
      }})
    }
  },
  reducers: {
    updateStore(state, action) {
      return {
        ...state,
        ...action.payload
      }
    }
  }
}

export default mod;
