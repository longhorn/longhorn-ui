import React, { PropTypes } from 'react'
import { DropOption } from '../../components'

function actions({ selected, toggleScheduling, showEditDisksModal }) {
  const handleMenuClick = (event, record) => {
    switch (event.key) {
      case 'editDisk':
        showEditDisksModal(record)
        break
      case 'disableScheduling':
      case 'enableScheduling':
        toggleScheduling(record)
        break
      default:
    }
  }
  const availableActions = [
    { key: 'editDisk', name: 'Edit Disks' },
  ]
  if (selected.conditions && selected.conditions.Ready.status.toLowerCase() === 'true' && Object.values(selected.disks).some(d => d.allowScheduling === true)) {
    if (selected.allowScheduling) {
      availableActions.push({ key: 'disableScheduling', name: 'Disable Scheduling' })
    } else {
      availableActions.push({ key: 'enableScheduling', name: 'Enable Scheduling' })
    }
  }
  return (
    <DropOption buttonStyle={{ padding: '0 0' }} menuOptions={availableActions} onMenuClick={(e) => handleMenuClick(e, selected)}
    />
  )
}

actions.propTypes = {
  selected: PropTypes.object,
  toggleScheduling: PropTypes.func,
  showEditDisksModal: PropTypes.func,
}

export default actions
