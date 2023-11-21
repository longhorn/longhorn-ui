import React from 'react'
import PropTypes from 'prop-types'
import { Modal } from 'antd'
import { DropOption } from '../../components'
const confirm = Modal.confirm

function actions({ selected, deleteEngineImage }) {
  const handleMenuClick = (event, record) => {
    event.domEvent?.stopPropagation?.()
    switch (event.key) {
      case 'delete':
        confirm({
          title: `Are you sure you want to delete engine image ${record.name}?`,
          onOk() {
            deleteEngineImage(record)
          },
        })
        break
      default:
    }
  }

  const availableActions = [{ key: 'delete', name: 'Delete', disabled: selected.default }]

  return (
    <DropOption menuOptions={availableActions}
      onMenuClick={(e) => handleMenuClick(e, selected)}
    />
  )
}

actions.propTypes = {
  selected: PropTypes.object,
  deleteEngineImage: PropTypes.func,
}

export default actions
