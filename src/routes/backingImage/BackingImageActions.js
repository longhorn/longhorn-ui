import React from 'react'
import PropTypes from 'prop-types'
import { Modal } from 'antd'
import { DropOption } from '../../components'
import { hasReadyBackingDisk } from '../../utils/status'
const confirm = Modal.confirm

function actions({ selected, deleteBackingImage, downloadBackingImage, showUpdateMinCopiesCount }) {
  const handleMenuClick = (event, record) => {
    event.domEvent?.stopPropagation?.()
    switch (event.key) {
      case 'delete':
        confirm({
          title: `Are you sure you want to delete backing image ${record.name}?`,
          okType: 'danger',
          okText: 'Delete',
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
      default:
    }
  }

  const disableDownloadAction = !hasReadyBackingDisk(selected)

  const availableActions = [
    { key: 'updateMinCopies', name: 'Update Minimum Copies Count', disabled: disableDownloadAction, tooltip: disableDownloadAction ? 'Missing disk with ready state' : '' },
    { key: 'download', name: 'Download', disabled: disableDownloadAction, tooltip: disableDownloadAction ? 'Missing disk with ready state' : '' },
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
  showUpdateMinCopiesCount: PropTypes.func,
}

export default actions
