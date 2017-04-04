import React, { PropTypes } from 'react'
import { Snapshot } from '../../components'
import { Modal } from 'antd'

const modal = ({
  visible,
  onCancel,
}) => {
  const modalOpts = {
    title: 'Snapshots',
    width: 1000,
    visible,
    onCancel,
  }

  return (
    <Modal className="lh-modal-snapshot" {...modalOpts}>
      <Snapshot />
    </Modal>
  )
}

modal.propTypes = {
  visible: PropTypes.bool,
  onCancel: PropTypes.func,
  item: PropTypes.object,
  onOk: PropTypes.func,
}

export default modal
