import React from 'react'
import PropTypes from 'prop-types'
import { Modal } from 'antd'
import { DropOption } from '../../components'
import { hasReadyBackingDisk } from '../../utils/status'
const confirm = Modal.confirm

function actions({ selected, deleteBackingImage, downloadBackingImage, createBackupBackingImage }) {
  const handleMenuClick = (event, record) => {
    event.domEvent?.stopPropagation?.()
    switch (event.key) {
      case 'delete':
        confirm({
          okText: 'Delete',
          okType: 'danger',
          title: `Are you sure you want to delete ${record.name} backing image ?`,
          onOk() {
            deleteBackingImage(record)
          },
        })
        break
      case 'download':
        downloadBackingImage(record)
        break
      case 'backup':
        createBackupBackingImage(record)
        break
      default:
    }
  }

  const disableAction = !hasReadyBackingDisk(selected)

  const availableActions = [
    { key: 'backup', name: ' Backup', disabled: disableAction, tooltip: disableAction ? 'Missing disk with ready state' : '' },
    { key: 'download', name: 'Download', disabled: disableAction, tooltip: disableAction ? 'Missing disk with ready state' : '' },
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
  deleteBackingImage: PropTypes.func,
  downloadBackingImage: PropTypes.func,
  createBackupBackingImage: PropTypes.func,
}

export default actions
