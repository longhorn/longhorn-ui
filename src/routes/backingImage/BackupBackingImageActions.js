import React from 'react'
import PropTypes from 'prop-types'
import { Modal } from 'antd'
import { DropOption } from '../../components'
const confirm = Modal.confirm

function actions({ selected, deleteBackupBackingImage, restoreBackingImage }) {
  const handleMenuClick = (event, record) => {
    event.domEvent?.stopPropagation?.()
    switch (event.key) {
      case 'delete':
        confirm({
          okText: 'Delete',
          okType: 'danger',
          title: <p>Are you sure you want to delete <strong>{record.name}</strong> backing image backup ?</p>,
          onOk() {
            deleteBackupBackingImage(record)
          },
        })
        break
      case 'restore':
        restoreBackingImage(record)
        break
      default:
    }
  }

  const disableRestoreAction = selected.state !== 'Completed'

  const availableActions = [
    { key: 'restore', name: 'Restore', disabled: disableRestoreAction, tooltip: disableRestoreAction ? 'Only complete state backup can be restored' : '' },
    { key: 'delete', name: 'Delete' },
  ]

  return (
    <DropOption menuOptions={availableActions}
      onMenuClick={(e) => handleMenuClick(e, selected)}
    />
  )
}

actions.propTypes = {
  selected: PropTypes.object,
  deleteBackupBackingImage: PropTypes.func,
  restoreBackingImage: PropTypes.func,
}

export default actions
