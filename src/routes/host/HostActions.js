import React from 'react'
import PropTypes from 'prop-types'
import { DropOption } from '../../components'

function actions({ selected, toggleScheduling, showEditDisksModal, showEditNodeModal, deleteHost }) {
  const handleMenuClick = (event, record) => {
    switch (event.key) {
      case 'editDisk':
        showEditDisksModal(record)
        break
      case 'editNode':
        showEditNodeModal(record)
        break
      case 'disableScheduling':
      case 'enableScheduling':
        toggleScheduling(record)
        break
      case 'deleteHost':
        deleteHost(record)
        break
      default:
    }
  }
  const menuOptions = []

  menuOptions.push({
    key: 'editNode',
    name: 'Edit node',
    disabled: selected.status.key === 'down',
    tooltip: selected.status.key === 'down' ? 'Node must not be down' : '',
  })

  if (selected.status.key === 'down') {
    menuOptions.push({
      key: selected.allowScheduling ? 'disableScheduling' : 'enableScheduling',
      name: selected.allowScheduling ? 'Disable Scheduling' : 'Enable Scheduling',
    })
  }

  let removeNodeTooltip = ''
  if (selected.status.key !== 'down') {
    removeNodeTooltip = 'Kubernetes node must be deleted first'
  } else if (selected.replicas.length > 0) {
    removeNodeTooltip = 'Replicas on this node must be deleted first'
  }
  menuOptions.push({
    key: 'deleteHost',
    name: 'Remove Node',
    disabled: removeNodeTooltip !== '',
    tooltip: removeNodeTooltip,
  })

  const tooltipProps = { placement: 'left' }
  return (
    <DropOption
      buttonStyle={{ padding: '0 0' }}
      menuOptions={menuOptions}
      tooltipProps={tooltipProps}
      onMenuClick={(e) => handleMenuClick(e, selected)}
    />
  )
}

actions.propTypes = {
  selected: PropTypes.object,
  toggleScheduling: PropTypes.func,
  showEditDisksModal: PropTypes.func,
  showEditNodeModal: PropTypes.func,
  deleteHost: PropTypes.func,
}

export default actions
