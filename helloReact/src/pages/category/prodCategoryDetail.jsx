/**
 * @(#)departmentManageDetail.jsx 0.5.1 2017-09-13
 * Copyright (c) 2017, YUNXI. All rights reserved.
 * YUNXI PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 */
import React, {PropTypes} from 'react'
import {connect} from 'dva'
import {
  Tree,
  Input,
  Button,
  Row,
  Col,
  Form,
  Modal,
  Popconfirm,
  Select,
  Icon,
  Upload,
  message,
  Checkbox,
  Card,
  Switch,
  Radio
} from 'antd';
import _ from 'lodash'
import style from './prodCategoryView.less'
import cx from 'classnames'
import {CustomCard} from '../../widget/Grid/index';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const formItemLayout = {
  labelCol: {
    span: 4
  },
  wrapperCol: {
    span: 20
  },
};
const formItemFullLayout = {
  labelCol: {
    span: 4
  },
  wrapperCol: {
    span: 20
  },
};

/*
 * 产品分类
 *
 * @author 苏离
 * @since 20180621
 */
const Detail = ({dispatch, form, data}) => {
  function submit() {
    validateFields((err) => {
      if (_.isEmpty(err)) {
        dispatch({type: `${namespace}/update`, payload: resetFields});
      }
    })
  }

  function inputChange(key, value) {
    let params = {};
    params[key] = value
    dispatch({
      type: `${namespace}/updateStore`, payload: {
        detailData: {...detailData, ...params}
      }
    })
  }
  //判断是否最后一层
  function verifyFinal(orginalData, parentId) {
    if(parentId == 0) return false;
    const parent = _.find(orginalData, d => d.id == parentId);
    if(parent && parent.parentId != 0) {
      const end = _.find(orginalData, d => d.id == parent.parentId);
      if(end && end.parentId == 0 ) return true;
    }
    return false;
  }

  const {getFieldDecorator, resetFields, validateFields} = form;
  const {detailData, actionType, btnLoading, namespace, originalCategoryList} = data;
  const isFinal = verifyFinal(originalCategoryList, detailData.parentId)

  return (
    <div className={cx(_.isEmpty(detailData) ? '' : style.detailContent)}>
      {
        _.isEmpty(detailData)
          ? <div className={cx(style.noDataInfo, 'text-info', 'txtcenter')}><Icon type="frown-o" className="fsize14"/>
          请选择左侧产品分类</div>
          : <Form autoComplete="off" className={style.hidePeopleIcon}>
          <CustomCard title="分类编辑">
            <FormItem {...formItemLayout} label="节点名称" hasFeedback>
              {
                getFieldDecorator('name', {
                  rules: [{
                    required: true, max: 10, message: '请输入节点名称，长度不能超过10!',
                  }, {
                    pattern: /^\S*$/, message: '节点名称不允许包含空字符串',
                  }],
                  initialValue: detailData.name
                })(
                  <Input onChange={e => inputChange('name', e.target.value)}  />
                )
              }
            </FormItem>
            <FormItem {...formItemLayout} label="描述">
              {
                getFieldDecorator('statement', {
                  rules: [{
                    required: false, max: 50, message: '请输入描述，长度不能超过50!',
                  }],
                  initialValue: detailData.statement
                })(
                  <Input type="textarea" style={{height: 50}} onChange={e => inputChange('statement', e.target.value)} />
                )
              }
            </FormItem>
            <FormItem {...formItemLayout} label="是否末级分类" hasFeedback>
              {
                isFinal
                  ? '是'
                  : <RadioGroup onChange={e => inputChange('isFinal', e.target.value)} value={detailData.isFinal + ''}>
                      <Radio value={1 + ''}>是</Radio>
                      <Radio value={0 + ''}>否</Radio>
                    </RadioGroup>
              }
            </FormItem>
            <FormItem {...formItemLayout} label="状态" hasFeedback>
              <RadioGroup onChange={e => inputChange('status', e.target.value)} value={detailData.status + ''}>
                <Radio value={1 + ''}>启用</Radio>
                <Radio value={0 + ''}>禁用</Radio>
              </RadioGroup>
            </FormItem>
          </CustomCard>
          {
            actionType === 'detail' || <div className={cx('txtcenter', 'mg2t')}>
              <Button type="primary" onClick={submit} loading={btnLoading}>
                <i className="iconfont icon-baocun"/>保存
              </Button>
            </div>
          }
        </Form>
      }
    </div>
  )
}

export default connect()(Form.create()(Detail))
