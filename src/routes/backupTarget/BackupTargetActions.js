import React from 'react'
import PropTypes from 'prop-types'
import { Modal } from 'antd'
import { DropOption } from '../../components'
const confirm = Modal.confirm

function actions({ selected, deleteBackupTarget, editBackupTarget }) {
  const handleMenuClick = (event, record) => {
    event.domEvent?.stopPropagation?.()
    switch (event.key) {
      case 'edit':
        editBackupTarget(record)
        break
      case 'delete':
        confirm({
          width: 'fit-content',
          okText: 'Delete',
          okType: 'danger',
          title: <p>Are you sure you want to delete <strong>{record.name}</strong> backup target ?</p>,
          onOk() {
            deleteBackupTarget(record)
          },
        })
        break
      default:
    }
  }

  const deleteActions = ({
    disabled: selected.name === 'default',
    tooltip: selected.name === 'default' ? 'Default backup target can not be deleted' : '',
  })

  const availableActions = [
    { key: 'edit', name: 'Edit' },
    {
      key: 'delete',
      name: 'Delete',
      disabled: deleteActions.disabled,
      tooltip: deleteActions.tooltip
    }
  ]

  return (
    <DropOption
      menuOptions={availableActions}
      onMenuClick={(e) => handleMenuClick(e, selected)}
    />
  )
}

actions.propTypes = {
  selected: PropTypes.object,
  deleteBackupTarget: PropTypes.func,
  editBackupTarget: PropTypes.func,
}

export default actions
