import React from 'react';
import { connect } from 'dva';
import PopUpSelect from 'widget/PopUpSelect/PopUpSelect'


const sellerTableColumn = [
  {title: '分销商编号', width: 200, dataIndex: 'code', key: 'code'},
  {title: "分销商名称", dataIndex: 'sellerName', key: 'sellerName'},
];
const sellerQueryList = [
  {name: '分销商编码', type: 'text', key: 'code', value: ''},
  {name: '分销商名称', type: 'text', key: 'sellerName', value: ''}
];
const sellerSelectedColumn = [
  {title: '分销商编码', width: 120, dataIndex: 'code', key: 'code'},
  {title: '分销商名称', dataIndex: 'sellerName', key: 'sellerName'},
];

export default class extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
      showModel: false,
      sellerList: []
    }
  }

  updateModal(status) {
    this.setState({showModel: status})
  }

  render(){
    const {showModel, sellerList} = this.state;

    return <div className="boxShadow">
      <a onClick={() => this.updateModal(true)}>打开多选弹框</a>
      <PopUpSelect
        idKey="sellerId"
        respListKey='sellers'
        tableColumn={sellerTableColumn}
        selectedColumn={sellerSelectedColumn}
        selectedTableScroll={{x: 420}}
        queryList={sellerQueryList}
        visible={showModel}
        closeCbk={e => this.updateModal(false)}
        confirmCbk={v => console.log('确认返回:', v)}
        isSave={true}
        isSingle={false}
        onItem={sellerList}
        defaultReqParams={{sellerStatus: 1}}
        status='1'
        requestUrl='/yundt/mgmt/shop/seller/list-by-page'
        title='选择分销商'
      />
    </div>
  }

}
