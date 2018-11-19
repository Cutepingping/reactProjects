/**
 * @(#)Footer.jsx 0.5.1 2017-09-13
 * Copyright (c) 2017, YUNXI. All rights reserved.
 * YUNXI PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 */
import React from 'react'
import {Button} from 'antd'
import cx from 'classnames'

/*
 * 弹框页脚按钮
 *
 * @author 苏离
 * @since 0.5.1
 */
export default ({text, onSubmit, onCancle, actionType, loading, btnType = 'save'}) => {
  let btnText = '保存';
  let icon = <i className="iconfont icon-baocun" />;
  if(btnType === 'confirm') {
    btnText = '确定'
    icon = '';
  }else if(btnType === 'submit') {
    btnText = '提交'
    icon = <i className="iconfont icon-queren" />;
  }

  return (<div className="txtcenter mg1">
	{
      actionType !== 'detail' && <Button type="primary" className="mg2r"
                                         onClick={onSubmit} loading={loading}>{icon}{text || btnText}</Button>
    }
    <Button className="mg1l" onClick={onCancle}>取消</Button>
  </div>);
}
