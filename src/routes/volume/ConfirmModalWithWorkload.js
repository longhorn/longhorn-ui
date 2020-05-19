import React from 'react'
import PropTypes from 'prop-types'
import { Modal, Checkbox, Alert } from 'antd'

class ConfirmModalWithWorkload extends React.Component {
  state = {
    selectedReplicaMap: {},
    showErrorMessage: false,
    disabled: true,
    checked: false,
  }

  onChange = e => {
    this.setState({
      ...this.state,
      checked: e.target.checked,
      disabled: !e.target.checked,
    })
  };

  render() {
    const description = (<div>Detaching a Volume when it is being used by a running Kubernetes Pod will result in crashing of the Pod and possible loss of data. The Volume cannot be used by the Kubernetes again until the original Pod is deleted. Are you sure you want to detach the volume?
    <div style={{ marginTop: 10 }}>
      <Checkbox
        checked={this.state.checked}
        onChange={this.onChange}
      >
        Yes I understand the risk and I want to detach the volume now.
      </Checkbox>
    </div></div>)

    return (
      <Modal
        title={this.props.title}
        visible={this.props.visible}
        onOk={this.props.onOk}
        onCancel={this.props.onCancel}
        okButtonProps={{ disabled: this.state.disabled }}
        width={690}
      >
        <Alert
          description={description}
          type="warning"
          showIcon
        />
      </Modal>
    )
  }
}

ConfirmModalWithWorkload.propTypes = {
  visible: PropTypes.bool,
  onCancel: PropTypes.func,
  onOk: PropTypes.func,
  title: PropTypes.string,
}

export default ConfirmModalWithWorkload
