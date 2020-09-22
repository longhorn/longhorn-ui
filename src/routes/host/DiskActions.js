import React from 'react'
import PropTypes from 'prop-types'
import { Modal } from 'antd'
import { DropOption } from '../../components'
const confirm = Modal.confirm

function actions({ selected, deleteDisk, updateDisk }) {
  const handleMenuClick = (event) => {
    switch (event.key) {
      case 'deleteDisk':
        confirm({
          title: `Are you sure you want to delete the disk ${selected.id}`,
          onOk() {
            deleteDisk(selected)
          },
        })
        break
      case 'updateDisk':
        updateDisk(selected)
        break
      default:
    }
  }

  const availableActions = [
    { key: 'updateDisk', name: 'Update Disk', disabled: selected.state === 'disconnected' },
    { key: 'deleteDisk', name: 'Delete Disk', disabled: selected.state === 'connected' && selected.allowScheduling, tooltip: selected.state === 'connected' && selected.allowScheduling ? 'Need to disable the scheduling before deleting the disk' : 'Directly deleting the disk will fail replicas using the disk' },
  ]

  return (
    <DropOption menuOptions={availableActions}
      onMenuClick={(e) => handleMenuClick(e, selected)}
    />
  )
}

actions.propTypes = {
  selected: PropTypes.object,
  deleteDisk: PropTypes.func,
  updateDisk: PropTypes.func,
}

export default actions
