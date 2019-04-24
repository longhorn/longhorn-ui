import React from 'react'
import PropTypes from 'prop-types'
import { Button, Form } from 'antd'
import { ModalBlur } from '../../components'

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
    <ModalBlur {...modalOpts}>
      Show the command to run Longhorn volume manager (/var/lib/docker disk will automatically be added)
    </ModalBlur>
  )
}

modal.propTypes = {
  visible: PropTypes.bool,
  onCancel: PropTypes.func,
}

export default Form.create()(modal)
