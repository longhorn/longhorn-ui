import React, { PropTypes } from 'react'
import { Modal } from 'antd'
import { DropOption } from '../../components'
const confirm = Modal.confirm

function actions({ selected, toggleScheduling, showEditDisksModal }) {
  const handleMenuClick = (event, record) => {
    switch (event.key) {
      case 'toggleScheduling':
        confirm({
          title: `Are you sure you want to ${record.allowScheduling ? 'disable' : 'enable'} scheduling for ${record.name}`,
          onOk() {
            toggleScheduling(record)
          },
        })
        break
      case 'editDisks':
        showEditDisksModal(record)
        break
      default:
    }
  }

  const availableActions = [{ key: 'toggleScheduling', name: selected.allowScheduling ? 'Disable' : 'Enable' }]
  if (selected.state === 'up') {
    availableActions.push({
      key: 'editDisks',
      name: 'Edit Disks',
    })
  }
  return (
    <DropOption menuOptions={availableActions} onMenuClick={(e) => handleMenuClick(e, selected)}
    />
  )
}

actions.propTypes = {
  selected: PropTypes.object,
  toggleScheduling: PropTypes.func,
  showEditDisksModal: PropTypes.func,
}

export default actions
