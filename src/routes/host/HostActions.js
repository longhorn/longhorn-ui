import React from 'react'
import PropTypes from 'prop-types'
import { DropOption } from '../../components'

function actions({ selected, toggleScheduling, showEditDisksModal, deleteHost }) {
  const handleMenuClick = (event, record) => {
    switch (event.key) {
      case 'editDisk':
        showEditDisksModal(record)
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
    key: 'editDisk',
    name: 'Edit node and disks',
    disabled: selected.status.key === 'down',
    tooltip: selected.status.key === 'down' ? 'Node must not be down' : '',
  })

  // let toggleSchedulingTooltip = ''
  // if (!selected.conditions || !selected.conditions.Ready) {
  //   toggleSchedulingTooltip = 'Node missing ready condition'
  // } else if (selected.conditions.Ready.status.toLowerCase() !== 'true') {
  //   toggleSchedulingTooltip = 'Node must be ready'
  // } else if (!Object.values(selected.disks).some(d => d.allowScheduling === true)) {
  //   toggleSchedulingTooltip = 'No disks enabled for scheduling'
  //   selected.allowScheduling = false
  // }
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
  deleteHost: PropTypes.func,
}

export default actions
