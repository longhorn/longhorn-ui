import React, { PropTypes } from 'react'
import { connect } from 'dva'
import { Modal, Button } from 'antd'
import './ModalBlur.less'

class ModalBlur extends React.Component {
  componentDidMount() {
    this.props.visible
      && this.props.dispatch({
        type: 'app/changeBlur',
        payload: this.props.visible,
      })
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.visible === nextProps.visible) {
      return
    }
    this.props.dispatch({
      type: 'app/changeBlur',
      payload: nextProps.visible,
    })
  }
  onCancel = () => {
    this.props.dispatch({
      type: 'app/changeBlur',
      payload: false,
    })
    this.props.onCancel && this.props.onCancel()
  }
  onOk = () => {
    this.props.dispatch({
      type: 'app/changeBlur',
      payload: false,
    })
    this.props.onOk && this.props.onOk()
  }
  render() {
    return (
      <Modal {...this.props} footer={[
        <Button key="cancel" onClick={this.onCancel}>Cancel</Button>,
        <Button key="ok" type="success" onClick={this.onOk}>
          {this.props.okText ? this.props.okText : 'OK'}
        </Button>,
      ]}></Modal>
    )
  }
}

ModalBlur.propTypes = {
  visible: PropTypes.bool,
  dispatch: PropTypes.func,
  onCancel: PropTypes.func,
  onOk: PropTypes.func,
  okText: PropTypes.string,
}

export default connect(({ app }) => ({ app }))(ModalBlur)
