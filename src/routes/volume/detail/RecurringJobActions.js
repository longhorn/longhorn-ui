import React from 'react'
import PropTypes from 'prop-types'
import { Modal } from 'antd'
import { DropOption } from '../../../components'
const confirm = Modal.confirm

function actions({ selected, deleteVolumeRecurringJob, editRecurringJob, isGroup = false }) {
  const handleMenuClick = (event, record) => {
    event.domEvent?.stopPropagation?.()
    switch (event.key) {
      case 'delete':
        confirm({
          title: `Are you sure you want to delete Recurring Job ${record.name}?`,
          onOk() {
            deleteVolumeRecurringJob(record)
          },
        })
        break
      case 'edit':
        editRecurringJob(record)
        break
      default:
    }
  }

  const availableActions = [
    { key: 'delete', name: 'Delete' },
  ]

  if (!isGroup) availableActions.push({ key: 'edit', name: 'Edit', disabled: selected.isAlreadyDeleted })

  return (
    <DropOption menuOptions={availableActions}
      onMenuClick={(e) => handleMenuClick(e, selected)}
    />
  )
}

actions.propTypes = {
  selected: PropTypes.object,
  deleteRecurringJob: PropTypes.func,
  editRecurringJob: PropTypes.func,
  isGroup: PropTypes.bool,
}

export default actions
