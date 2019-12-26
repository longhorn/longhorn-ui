import React from 'react'
import PropTypes from 'prop-types'
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
    if (this.props.visible) {
      document.addEventListener('keydown', this.onkeydown, false)
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.visible === nextProps.visible) {
      return
    }
    this.props.dispatch({
      type: 'app/changeBlur',
      payload: nextProps.visible,
    })
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onkeydown, false)
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

  onkeydown = (e) => {
    if (e.keyCode === 13) {
      this.onOk()
    }
  }

  width = this.props.width ? this.props.width : 'auto'

  render() {
    let item = this.props.hasOnCancel ? '' : <Button key="cancel" onClick={this.onCancel}>Cancel</Button>
    return (
      <Modal footer={[
        item,
        <Button loading={this.props.disabled} disabled={this.props.disabled} width={this.width} key="ok" type="success" onClick={this.onOk}>
          {this.props.okText ? this.props.okText : 'OK'}
        </Button>,
      ]}
        {...this.props}>
      </Modal>
    )
  }
}

ModalBlur.propTypes = {
  visible: PropTypes.bool,
  dispatch: PropTypes.func,
  onCancel: PropTypes.func,
  onOk: PropTypes.func,
  okText: PropTypes.string,
  hasOnCancel: PropTypes.bool,
  width: PropTypes.number,
  disabled: PropTypes.bool,
}

export default connect(({ app }) => ({ app }))(ModalBlur)
