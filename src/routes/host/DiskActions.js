import React from 'react'
import PropTypes from 'prop-types'
import { Modal } from 'antd'
import { DropOption } from '../../components'
const confirm = Modal.confirm

function actions({ node, selected, connectNode, disconnectNode, deleteDisk, updateDisk }) {
  const handleMenuClick = (event) => {
    switch (event.key) {
      case 'connectNode':
      {
        connectNode(selected)
        break
      }
      case 'disconnectNode':
        confirm({
          title: `Are you sure you want to disconnect the disk ${selected.id} from node ${node.id}`,
          onOk() {
            disconnectNode(selected)
          },
        })
        break
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
    { key: 'updateDisk', name: 'Update Disk' },
    { key: 'connectNode', name: 'Connect Node', disabled: selected.nodeID },
    { key: 'disconnectNode', name: 'Disconnect Node', disabled: !selected.nodeID },
    { key: 'deleteDisk', name: 'Delete Disk', disabled: selected.replicas > 0 || (selected.state === 'connected' && selected.allowScheduling), tooltip: 'Need to clean up all related replicas and disable the scheduling before deleting the disk' },
  ]

  return (
    <DropOption menuOptions={availableActions}
      onMenuClick={(e) => handleMenuClick(e, selected)}
    />
  )
}

actions.propTypes = {
  node: PropTypes.object,
  selected: PropTypes.object,
  connectNode: PropTypes.func,
  disconnectNode: PropTypes.func,
  deleteDisk: PropTypes.func,
  updateDisk: PropTypes.func,
}

export default actions
