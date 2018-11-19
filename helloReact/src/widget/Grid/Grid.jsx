/**
 * @(#)Grid.jsx 0.5.1 2017-09-13
 * Copyright (c) 2017, YUNXI. All rights reserved.
 * YUNXI PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 */
import React from 'react'
import {Table, Row, Col, Input, Popconfirm, Select, Form, DatePicker, TreeSelect, Cascader, InputNumber} from 'antd'
import {cloneDeep, isEmpty} from 'lodash'
import cx from 'classnames'
import {connect} from 'dva'
import styles from './Grid.less'
import moment from 'moment';
import _ from 'lodash'
import { setLocalData } from '../../utils/globalScope'
import config from '../../config/config'

const {RangePicker, MonthPicker } = DatePicker;
const FormItem = Form.Item;
const Option = Select.Option;
const formItemLayout = {
  labelCol: {
    xs: {span: 8},
    sm: {span: 8},
  },
  wrapperCol: {
    xs: {span: 16},
    sm: {span: 16},
  },
};
const bigFormItemLayout = {
  labelCol: {
    xs: {span: 4},
    sm: {span: 4},
  },
  wrapperCol: {
    xs: {span: 10},
    sm: {span: 10},
  },
};

/*
 * 动态生成搜索框组件
 *
 * @author 苏离
 * @since 0.5.1
 */
export const QueryCondition = ({data, inputChange,searchBtn}) => {

  function disabledDate(type, value,item)  {
    let result = false;
    if (isEmpty(item)) {
      result = false;
    } else {
      if(type === 'start') {
        //如果是开始时间，需要校验结束时间
        if(item[1]) {
          result = value.startOf('month').valueOf() >= moment(item[1]).valueOf()
        }
      } else {
        //如果是结束时间，需要校验开始时间
        if(item[0]) {
          result = value.startOf('month').valueOf() <= moment(item[0]).valueOf()
        }
      }
    }

    return result;
  }

  let list = [];
  if (!isEmpty(data)) {
    list = data.map((item, index) => {
      let cascaderList = cloneDeep(item.list);
      item.type === 'cascader' && cascaderList.unshift({label: '请选择', value: 'all', key: 'all'});
      if(item.type === 'date'){
        return <Col xl={6} lg={8} md={12} xs={12} key={`Col-${index}`}>
          <FormItem {...formItemLayout} label={item.name} className={cx(styles.inputComponent, styles.rangePicker)}>
            {item.type === 'date' && <RangePicker style={{width: '100%'}} allowClear={false}
              showTime={{ format: 'HH:mm' }} format="YYYY-MM-DD HH:mm" placeholder={['开始时间', '结束时间']}
              onChange={(dates, dateStrings) => inputChange(item.key, dateStrings)}
              value={!isEmpty(item.value) ? [moment(item.value[0]), moment(item.value[1])] : []}/>
            }
          </FormItem>
        </Col>
			}
			if (item.type === 'select') {
				return <Col xl={6} lg={8} md={12} xs={12} key={`Col-${index}`}>
					<FormItem {...formItemLayout} label={item.name} className={cx(styles.inputComponent)}>
            {/* Input type='hidden 解决在某些机器下，自动换行问题 */}
					  <Input type='hidden'/>
						<Select value={item.value ? item.value + '' : (item.notNeedAll ? '' : 'all')} placeholder={'请选择' + item.name}
						onChange={v => inputChange(item.key, v === 'all' ? '' : v)}>
						{item.notNeedAll || <Option value={'all'}>请选择</Option> }
						{
							item.list.map((d, i) => {
								return <Option key={`${item.key}${i}`} value={d.id + ''}>{d.name}</Option>
							})
						}
						</Select>
					</FormItem>
				</Col>
			}
      return <Col xl={6} lg={8} md={12} xs={12} key={`Col-${index}`}>
        <FormItem {...formItemLayout} label={item.name} className={cx(styles.inputComponent)}>
          {item.type === 'time' && <RangePicker style={{width: '100%'}} allowClear={false}
            onChange={(dates, dateStrings) => inputChange(item.key, dateStrings)}
            value={!isEmpty(item.value) ? [moment(item.value[0]), moment(item.value[1])] : []}/>
          }
          {item.type === 'date' && <RangePicker style={{width: '100%'}} allowClear={false}
            showTime={{ format: 'HH:mm' }} format="YYYY-MM-DD HH:mm" placeholder={['开始时间', '结束时间']}
            onChange={(dates, dateStrings) => inputChange(item.key, dateStrings)}
            value={!isEmpty(item.value) ? [moment(item.value[0]), moment(item.value[1])] : []}/>
          }
          {item.type === 'month' && <span>
              <MonthPicker style={{width: '47%'}} placeholder="开始日期" onChange={(dates, dateString) => {
                let value = item.value;
                value
                  ? value[0] = dateString
                  : value = [dateString];
                inputChange(item.key, value)
              }}  disabledDate={(v) => disabledDate('start', v, item.value)} value={!isEmpty(item.value[0]) ? moment(item.value[0]) : null} format="YYYY-MM" />
              <span className={cx(styles.monthSpliter)}>-</span>
              <MonthPicker placeholder="结束日期"  style={{width: '47%'}} onChange={(dates, dateString) => {
                let value = item.value;
                value
                  ? value[1] = dateString
                  : value = [null,dateString];
                inputChange(item.key, value)
              }} disabledDate={(v) => disabledDate('end', v, item.value)} value={!isEmpty(item.value[1]) ? moment(item.value[1]) : null} format="YYYY-MM" />
            </span>
          }
          {
            item.type === 'comboSelect' &&
            <Select mode="combobox" value={item.value ? item.value + '' : ''} filterOption={(inputValue, option) => {
              return option.props.searchValue.includes(inputValue)
            }} placeholder={item.placeholder || '请输入' + item.name}
              onSelect={(v) => {
                inputChange(item.key, v.split(' ')[1] || v, v)
              }}
              onSearch={v => inputChange(item.key, v)}>
              {
                item.list.map((d, i) => {
                  let value = item.isUniqueName ? d.name: (d.id + ' ' + d.name);
                  let name = item.isUniqueName ? d.name : (d.id + ' ' + d.name);
                  return <Option  searchValue={d.searchValue} key={`${item.key}${i}`} value={value}>{name}</Option>
                })
              }
            </Select>
          }
          {
            item.type === 'mulSelect' &&
            <Select value={item.value || []} placeholder={'请选择' + item.name} mode="multiple"
              onChange={v => inputChange(item.key, v)}>
              {
                item.list.map((d, i) => {
                  return <Option key={`${item.key}${i}`} value={d.id + ''}>{d.name}</Option>
                })
              }
            </Select>
          }
          {
            item.type === 'text' &&
            <Input onChange={e => e.target.value.length < 36 && inputChange(item.key, _.trim(e.currentTarget.value))}
              value={item.value}
              placeholder={item.placeholder ? item.placeholder: '请输入' + item.name}
            />
          }
          {
            item.type === 'treeSelect' &&
            <TreeSelect value={item.value ? item.value + '' : null} dropdownStyle={{maxHeight: 400, overflow: 'auto'}}
              treeCheckStrictly
              treeData={item.list} placeholder={'请选择' + item.name} treeDefaultExpandAll
              onChange={v => inputChange(item.key, v)}/>
          }
          {
            item.type === 'cascader' &&
            <Cascader style={{width: '100%'}} value={item.value ? item.value : ['all']} placeholder={'请选择' + item.name} options={cascaderList}
              onChange={v => inputChange(item.key, v)} changeOnSelect/>
          }
          {
            item.type === 'numRange' && <span>
              <InputNumber min={0} precision={item.precision ? item.precision : 0} style={{width: 80, marginRight: 0}} onChange={v => {
                item.value[0] = v;
                inputChange(item.key, item.value, 0)
              }} value={item.value && item.value[0] ? item.value[0] : ''} />
              <span className="mg2l mg2r">~</span>
              <InputNumber min={0} precision={item.precision ? item.precision : 0} style={{width: 80, marginRight: 0}} onChange={v => {
                item.value[1] = v;
                inputChange(item.key, item.value)
              }} value={item.value && item.value[1] ? item.value[1] : ''} />
            </span>
          }
        </FormItem>
      </Col>;
    })
  }
  return <Row>
		{list}
		{searchBtn}
  </Row>;
};

//分页控件
const pagination = ({pageChange, total, pageConfig, nameSpace, dispatch}) => {
  let pageChangeEvent;
  //当前路径
  const path = location.hash.split('?')[0].slice(1);
  if (!(typeof pageChange === 'function')) {
    pageChangeEvent = (pageIndex, pageSize) => dispatch({
      type: `${nameSpace}/${pageChange}`,
      payload: {pageIndex, pageSize, key: 'tableData'}
    })
  } else {
    pageChangeEvent = pageChange;
  }
  setLocalData(path, pageConfig.pageSize)
  return {
    pageSize: pageConfig.pageSize,
    showTotal: total => `共 ${total} 条`,
    showQuickJumper: true,
    current: pageConfig.current || 1,
    total,
    showSizeChanger: true,
    onChange: (current, pageSize) => pageChangeEvent(current, pageSize),
    pageSizeOptions: pageConfig.pageSizeOptions || config.largePageSizeList,
    onShowSizeChange: (current, pageSize) => pageChangeEvent(current, pageSize),
  }
};

/*
 *columns: array，对应表格头部
 *dataSource：array，表格主体内容
 *pageChange: 翻页时触发的方法
 *selectedRowKeys: 选中项的 key 数组
 *selectedKeysChange: 选中项改变时触发
 *total：分页数据总条数
 */
//通用table组件
const TableComponent = ({dispatch, nameSpace, data, selectedKeysChange, pageChange, conditionLine = 1,
  scroll = {x: 1500}, loading, disableVerify, paginationFlag = true, isDisplayOrder = false}) => {
  const {columns, tableData, selectedRowKeys, pageConfig} = data;
  const {total, dataSource} = tableData;

  const rowSelection = {
    selectedRowKeys,
    onChange: selectedRowKeys => {
      dispatch({type: `${nameSpace}/${selectedKeysChange}`, payload: {selectedRowKeys}})
    },
    getCheckboxProps: record => ({
      disabled: disableVerify ? disableVerify(record) : false,
    })
  };
  !isEmpty(dataSource) && dataSource.forEach((item, index) => {
    isEmpty(item.key) && (item.key = item.id || index);
  })
  //查询条件行的高度
  const queryLine = 52;

  const {current, pageSize} = pageConfig;
  let copyColumns = cloneDeep(columns);
  isDisplayOrder && copyColumns.unshift({
    title: '序号',
    width: 60,
    dataIndex: 'commonOrder',
    key: 'commonOrder',
    render: (data, record, index) => (current - 1) * pageSize + index + 1
  })
  return <Table className={cx(styles.textNoWrap, styles.table)} columns={copyColumns}
    rowSelection={selectedRowKeys ? rowSelection : null}
    dataSource={dataSource} loading={loading} scroll={{...scroll, y: (!isEmpty(dataSource) && dataSource.length > 15) ? 500: ''}}
    pagination={paginationFlag ? pagination({pageChange, nameSpace, total, pageConfig, dispatch}): false}/>;
};

//导出可编辑表格、通用表格
export const Grid = connect()(TableComponent);
