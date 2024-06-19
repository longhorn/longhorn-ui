import React from 'react'
import PropTypes from 'prop-types'
import { Modal } from 'antd'
import { DropOption } from '../../components'
import { hasReadyBackingDisk } from '../../utils/status'

const confirm = Modal.confirm

function actions({ selected, deleteBackingImage, downloadBackingImage, openBackupBackingImageModal, hasWritableBackupTargets }) {
  const handleMenuClick = (event, record) => {
    event.domEvent?.stopPropagation?.()
    switch (event.key) {
      case 'delete':
        confirm({
          title: `Are you sure you want to delete backing image ${record.name}?`,
          onOk() {
            deleteBackingImage(record)
          },
        })
        break
      case 'download':
        downloadBackingImage(record)
        break
      case 'backup': {
        openBackupBackingImageModal(record)
        break
      }
      default:
    }
  }

  const disableAction = !hasReadyBackingDisk(selected)

  const disabledBackupAction = !hasWritableBackupTargets || !hasReadyBackingDisk(selected)
  const backupTargetMessageTooltip = !hasWritableBackupTargets ? 'No backup target is available and writable' : 'Missing disk with ready state'

  const availableActions = [
    { key: 'download', name: 'Download', disabled: disableAction, tooltip: disableAction ? 'Missing disk with ready state' : '' },
    { key: 'backup', name: 'Backup', disabled: disabledBackupAction, tooltip: disabledBackupAction ? backupTargetMessageTooltip : '' },
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
  openBackupBackingImageModal: PropTypes.func,
}

export default actions
