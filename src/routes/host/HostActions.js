import React from 'react'
import PropTypes from 'prop-types'
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
}

export default actions
