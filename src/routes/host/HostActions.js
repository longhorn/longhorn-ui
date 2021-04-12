import React from 'react'
import PropTypes from 'prop-types'
import { DropOption } from '../../components'

function actions({ selected, showEditDisksModal, deleteHost }) {
  const handleMenuClick = (event, record) => {
    switch (event.key) {
      case 'editDisk':
        showEditDisksModal(record)
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

  let removeNodeTooltip = ''
  if (selected.status.key !== 'down') {
    removeNodeTooltip = 'Kubernetes node status must be down first'
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
  showEditDisksModal: PropTypes.func,
  deleteHost: PropTypes.func,
}

export default actions
