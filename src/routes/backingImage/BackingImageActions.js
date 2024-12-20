import React from 'react'
import PropTypes from 'prop-types'
import { Modal } from 'antd'
import { DropOption } from '../../components'
import { hasReadyBackingDisk } from '../../utils/status'

const confirm = Modal.confirm

function actions({
  selected,
  backupProps,
  deleteBackingImage,
  downloadBackingImage,
  showUpdateMinCopiesCount,
  openBackupBackingImageModal,
}) {
  const { backupTargetAvailable, backupTargetMessage } = backupProps

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
      case 'updateMinCopies':
        showUpdateMinCopiesCount(record)
        break
      case 'backup': {
        openBackupBackingImageModal(record)
        break
      }
      default:
    }
  }

  const disableAction = !hasReadyBackingDisk(selected)
  const getBackupActionTooltip = () => {
    if (!backupTargetAvailable) {
      return backupTargetMessage
    }
    return disableAction ? 'Missing disk with ready state' : ''
  }

  const availableActions = [
    {
      key: 'updateMinCopies',
      name: 'Update Minimum Copies Count',
      disabled: disableAction,
      tooltip: disableAction ? 'Missing disk with ready state' : ''
    },
    {
      key: 'backup',
      name: ' Back Up',
      disabled: disableAction || backupTargetAvailable === false,
      tooltip: getBackupActionTooltip()
    },
    {
      key: 'download',
      name: 'Download',
      disabled: disableAction || selected.dataEngine === 'v2',
      tooltip: disableAction ? 'Missing disk with ready state' : ''
    },
    {
      key: 'delete',
      name: 'Delete'
    },
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
  showUpdateMinCopiesCount: PropTypes.func,
  backupProps: PropTypes.object,
  openBackupBackingImageModal: PropTypes.func,
}

export default actions
