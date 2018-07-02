import React, { PropTypes } from 'react'
import { Modal } from 'antd'
import { DropOption } from '../../components'
const confirm = Modal.confirm

function actions({ selected, toggleScheduling }) {
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
      default:
    }
  }

  const availableActions = [{ key: 'toggleScheduling', name: selected.allowScheduling ? 'Disable' : 'Enable' }]
  return (
    <DropOption menuOptions={availableActions} onMenuClick={(e) => handleMenuClick(e, selected)}
    />
  )
}

actions.propTypes = {
  selected: PropTypes.object,
  toggleScheduling: PropTypes.func,
}

export default actions
