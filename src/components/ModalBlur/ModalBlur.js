import React, { PropTypes } from 'react'
import { connect } from 'dva'
import { Modal } from 'antd'

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
  onCancel() {
    this.props.dispatch({
      type: 'app/changeBlur',
      payload: false,
    })
    this.props.onCancel && this.props.onCancel()
  }
  render() {
    return (
      <Modal {...this.props} onCancel={this.onCancel.bind(this)}></Modal>
    )
  }
}

ModalBlur.propTypes = {
  visible: PropTypes.string,
  dispatch: PropTypes.func,
  onCancel: PropTypes.func,
}

export default connect(({ app }) => ({ app }))(ModalBlur)
