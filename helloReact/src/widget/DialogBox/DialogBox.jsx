import React from 'react'
import {Modal} from 'antd'

//删除对话框
export const confirm = ({title, content, onOk}) => {
  Modal.confirm({
    title,
    content,
    style: {top: '40%'},
    onOk,
  });
};

const successConfirm = ({title, content}) => {
  Modal.success({
    title,
    content,
    style: {top: '40%'},
  });
}
