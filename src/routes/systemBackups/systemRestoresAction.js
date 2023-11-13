import React from 'react'
import PropTypes from 'prop-types'
import { Modal, Alert, Icon } from 'antd'
import { DropOption } from '../../components'
const confirm = Modal.confirm

function actions({ selected, deleteSystemRestore }) {
  const handleMenuClick = (event, record) => {
    event.domEvent?.stopPropagation?.()
    let title = <div><Icon style={{ marginRight: 5 }} className="color-warning" type="info-circle" />Are you sure you want to delete System Restore {record.name} ?</div>
    if (record.state === 'Pending' || record.state === 'Restoring' || record.state === 'Downloading') {
      title = (<div>
        <div style={{ marginBottom: 10 }}><Icon style={{ marginRight: 5 }} className="color-warning" type="info-circle" />Are you sure you want to delete System Restore {record.name}</div>
        <Alert
          message={'Deleting restoring system backup will abort the remaining resource rollout. An incomplete restore may cause Longhorn system resource inconsistencies leading to unexpected behavior.'}
          type="warning"
        />
      </div>)
    }
    switch (event.key) {
      case 'delete':
        confirm({
          width: 600,
          icon: '',
          title,
          onOk() {
            deleteSystemRestore(record)
          },
        })
        break
      default:
    }
  }

  const availableActions = [
    { key: 'delete', name: 'Delete' },
  ]

  return (
    <DropOption menuOptions={availableActions}
      onMenuClick={(e) => handleMenuClick(e, selected)}
    />
  )
}

actions.propTypes = {
  selected: PropTypes.object,
  deleteSystemRestore: PropTypes.func,
}

export default actions
