import React from 'react';
import { connect } from 'dva';
import KingEditor from 'widget/Editor/KingEditor'


export default class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      detail: ''
    }
  }

  render() {
    return <KingEditor id="KingEditor" style={{width: '100%', height: 500}} html={this.state.detail} inputChange={html => this.setState({ detail: html })} />
  }
}
