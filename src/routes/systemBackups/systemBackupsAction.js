import React from 'react'
import PropTypes from 'prop-types'
import { Modal } from 'antd'
import { DropOption } from '../../components'
const confirm = Modal.confirm

function actions({ selected, deleteSystemBackup, createSystemRestore }) {
  const handleMenuClick = (event, record) => {
    event.domEvent?.stopPropagation?.()
    switch (event.key) {
      case 'delete':
        confirm({
          title: `Are you sure you want to delete System Backup ${record.name}?`,
          onOk() {
            deleteSystemBackup({ name: record.id })
          },
        })
        break
      case 'restore':
        createSystemRestore(record)
        break
      default:
    }
  }

  const availableActions = [
    { key: 'delete', name: 'Delete' },
    { key: 'restore', name: 'Restore' },
  ]

  return (
    <DropOption menuOptions={availableActions}
      onMenuClick={(e) => handleMenuClick(e, selected)}
    />
  )
}

actions.propTypes = {
  selected: PropTypes.object,
  deleteSystemBackup: PropTypes.func,
  createSystemRestore: PropTypes.func,
}

export default actions
