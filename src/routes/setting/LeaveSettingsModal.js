import React from 'react'
import PropTypes from 'prop-types'
import { Icon } from 'antd'
import { ModalBlur } from '../../components'

const modal = ({
  visible,
  onCancel,
  onOk,
  changedSettings,
}) => {
  const modalOpts = {
    title: 'Leave General Settings ?',
    visible,
    onCancel,
    onOk,
    okText: 'Leave',
  }

  return (
    <ModalBlur {...modalOpts}>
      <p type="warning">
        <Icon style={{ marginRight: '10px' }} type="exclamation-circle" />
        You have unsaved changes below.
      </p>
      <ul>
        {Object.keys(changedSettings).sort().map((key) => (
          <li key={key}>
            {`${key}`} : <strong>{`${changedSettings[key]}`}</strong>
          </li>
        ))}
      </ul>
      <p>Are you sure you want to leave this page?</p>
    </ModalBlur>
  )
}

modal.propTypes = {
  visible: PropTypes.bool,
  onCancel: PropTypes.func,
  onOk: PropTypes.func,
  changedSettings: PropTypes.object,
}

export default modal
