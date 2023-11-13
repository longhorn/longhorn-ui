import React from 'react'
import PropTypes from 'prop-types'
import { Modal } from 'antd'
import { DropOption } from '../../components'
const confirm = Modal.confirm

function actions({ node, selected, updateDisk }) {
  const handleMenuClick = (event, record) => {
    event.domEvent?.stopPropagation?.()
    switch (event.key) {
      case 'togglingScheduling':
      {
        const updateDisks = Object.keys(node.disks)
          .map(id => ({ ...node.disks[id], allowScheduling: id === record.id ? !record.allowScheduling : node.disks[id].allowScheduling }))
        updateDisk(updateDisks, node.actions.diskUpdate)
        break
      }
      case 'delete':
        confirm({
          title: `Are you sure you want to delete the disk that is mounted on ${record.path}?`,
          onOk() {
            const disks = Object.keys(node.disks)
              .filter(id => record.id !== id)
              .map(id => ({ ...node.disks[id] }))
            updateDisk(disks, node.actions.diskUpdate)
          },
        })
        break
      default:
    }
  }

  const availableActions = [
    { key: 'togglingScheduling', name: selected.allowScheduling ? 'Disable Scheduling' : 'Enable Scheduling' },
  ]
  const deleteAction = { key: 'delete', name: 'Delete' }
  if (!node.storageScheduled && !selected.allowScheduling) {
    availableActions.push(deleteAction)
  }
  return (
    <DropOption menuOptions={availableActions}
      onMenuClick={(e) => handleMenuClick(e, selected)}
    />
  )
}

actions.propTypes = {
  node: PropTypes.object,
  selected: PropTypes.object,
  updateDisk: PropTypes.func,
}

export default actions
