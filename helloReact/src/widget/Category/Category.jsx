/**
 * @(#)Category.jsx 0.5.1 2017-09-13
 * Copyright (c) 2017, YUNXI. All rights reserved.
 * YUNXI PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 */
import React, {PropTypes} from 'react'
import {
  Tree, Input, Button, Row, Col, Form, Modal, Popconfirm, Select, Icon, Upload, message, Checkbox, Pagination, Popover
} from 'antd';
import _ from 'lodash'
import style from './Category.less'
import cx from 'classnames'

const TreeNode = Tree.TreeNode;
const Search = Input.Search;

/*
 * 类目树
 *
 * @author 苏离
 * @since 0.5.1
 */
export const Category = ({
     categoryList, contentHeight, autoExpandParent, searchValue, expandedKeys, children, selectedKeys,
     selectCategory, leftSpan, rightSpan, width, dispatch, nameSpace, originalCategoryList, deleteItem,
     create, pageConfig, sort, isSort, isFinalNode
   }) => {

  // 自定义树形title
  function genTreeTitle(title, item) {
    return (
      <div style={{height: '24px'}}>
        <Popover placement="leftTop" content={item.id === '0'
          ? <span className={cx(style.btnContent)}>
              <Button onClick={(e) => {
                // 阻止事件冒泡
                e.stopPropagation();
                create(item.id)
              }}>
                <Icon type="plus"/>新增
              </Button>
            </span>
          : <span className={cx(style.btnContent)}>
            {
              //如果是最后节点，不予许新增
              isFinalNode && isFinalNode(item) && <p>
                <Button className={style.btnFirst} onClick={(e) => {
                // 阻止事件冒泡
                e.stopPropagation();
                create(item.id)
              }}><Icon type="plus"/>新增</Button></p>
            }
              <p>
                <Popconfirm Collapse title={`确定要删除吗？`} okText='确定' cancelText='取消' onConfirm={() =>deleteItem(item.id)}>
                    <Button className={cx(style.btn, 'mg1t')} onClick={(e) => {
                      // 阻止事件冒泡
                      e.stopPropagation();
                    }}><Icon type="delete"/>删除
                    </Button>
                </Popconfirm>
              </p>
            {/*-2置底，-1下移，1上移，2置顶*/}
            {
              isSort && <span>
                    <p>
                      <Button className={cx(style.btn, 'mg1t')} onClick={(e) => {
                        // 阻止事件冒泡
                        e.stopPropagation();
                        sort(item.id, 1)
                      }}><i className="iconfont icon-shu-shangyi"></i>上移</Button>
                    </p>
                    <p>
                      <Button className={cx(style.btn, 'mg1t')} onClick={(e) => {
                        // 阻止事件冒泡
                        e.stopPropagation();
                        sort(item.id, -1)
                      }}><i className="iconfont icon-shu-xiayi"></i>下移</Button>
                    </p>
                    <p>
                      <Button className={cx(style.btn, 'mg1t')} onClick={(e) => {
                        // 阻止事件冒泡
                        e.stopPropagation();
                        sort(item.id, 2)
                      }}><i className="iconfont icon-shu-zhiding"></i>置顶</Button>
                    </p>
                    <p>
                      <Button className={cx(style.btn, 'mg1t')} onClick={(e) => {
                        // 阻止事件冒泡
                        sort(item.id, -2)
                      }}><i className="iconfont icon-shu-zhidi"></i>置底</Button>
                    </p>
                  </span>
            }
              </span>} title={null}>
          <span>{title}</span>
        </Popover>
      </div>
    )
  }

  function loop(data) {
    return data.map((item) => {
      item.key = item.id + '';
      const name = item.name;
      const index = name.search(searchValue);
      const beforeStr = name.substr(0, index);
      const afterStr = name.substr(index + searchValue.length);
      const title = index > -1 ? (
        <span>
        {beforeStr}
          <span style={{color: '#f50'}}>{searchValue}</span>
          {afterStr}
      </span>
      ) : <span>{name}</span>;
      if (item.children) {
        return (
          <TreeNode key={item.id} title={genTreeTitle(title, item)}>
            {loop(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode key={item.id} title={genTreeTitle(title, item)}/>;
    })
  };

  function getParentKey(key, tree) {
    let parentKey;
    for (let i = 0; i < tree.length; i++) {
      const node = tree[i];
      if (node.children) {
        if (node.children.some(item => item.name === key)) {
          parentKey = node.key;
        } else if (getParentKey(key, node.children)) {
          parentKey = getParentKey(key, node.children);
        }
      }
    }
    return parentKey;
  };

  function onSearch(v) {
    let value = _.trim(v);
    if (_.isEmpty(originalCategoryList)) {
      _.isEmpty(originalCategoryList) && message.error('没有数据！');
      return;
    }
    dispatch({
      type: `${nameSpace}/pageChange`,
      payload: { searchValue: _.trim(value), isReExpand: true, page: 1}
    })
  }

  function pageChange(page, pageSize) {
    dispatch({type: `${nameSpace}/pageChange`, payload: {page}})
  }

  return (
    <div className={cx('txtcenter')}>
      <Row style={{width}} className={cx(style.content, 'iblock', 'txtleft')}>
        <Col span={leftSpan} className={style.conetentLeft}>
          <div className={style.area1}>
            <Search style={{width: '100%'}} placeholder="搜索" onSearch={onSearch}/>
            <div className="mg2t text-info">
              <Icon type="exclamation-circle fsize14"/> 点击节点可显示详情
            </div>
          </div>
          <div className={style.area2}>
            <div className={style.tree} style={{height: contentHeight}}>
              <Tree onSelect={selectCategory} autoExpandParent={autoExpandParent} selectedKeys={selectedKeys}
                onExpand={expandedKeys => dispatch({
                  type: `${nameSpace}/updateStore`,
                  payload: {expandedKeys, autoExpandParent: false}
                })}
                expandedKeys={expandedKeys} showLine>
                {loop(categoryList)}
              </Tree>
            </div>
          </div>
          <div className={cx('txtcenter', 'mg2b', style.pagination)}>
            <Pagination simple onChange={pageChange} current={pageConfig.current} total={pageConfig.total}
              defaultPageSize={pageConfig.size}/>
          </div>
        </Col>
        <Col span={rightSpan} className={cx(style.conetentRight, 'treeRight')}>
          {children}
        </Col>
      </Row>
    </div>
  )
}
