import React, { PropTypes } from 'react'
import { Snapshot, ModalBlur } from '../../components'

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
    <ModalBlur className="lh-modal-snapshot" {...modalOpts}>
      <Snapshot />
    </ModalBlur>
  )
}

modal.propTypes = {
  visible: PropTypes.bool,
  onCancel: PropTypes.func,
  item: PropTypes.object,
  onOk: PropTypes.func,
}

export default modal
