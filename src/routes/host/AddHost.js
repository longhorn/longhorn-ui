import React, { PropTypes } from 'react'
import { Button, Form, Modal } from 'antd'

const modal = ({
  visible,
  onCancel,
}) => {
  const modalOpts = {
    title: 'Add Host',
    visible,
    onCancel,
    footer: [
      <Button key="submit" type="primary" size="large" onClick={onCancel}>
        OK
      </Button>,
    ],
  }

  return (
    <Modal {...modalOpts}>
      Show the command to run Longhorn volume manager (/var/lib/docker disk will automatically be added)
    </Modal>
  )
}

modal.propTypes = {
  visible: PropTypes.bool,
  onCancel: PropTypes.func,
}

export default Form.create()(modal)
