import React from 'react'
import PropTypes from 'prop-types'
import { Modal } from 'antd'
import { DropOption } from '../../components'
const confirm = Modal.confirm

function actions({ selected, deleteSnapshotGroup, recreateSnapshotGroup }) {
  const handleMenuClick = (event, record) => {
    event.domEvent?.stopPropagation?.()
    switch (event.key) {
      case 'recreate':
        recreateSnapshotGroup(record)
        break
      case 'delete':
        confirm({
          width: 'fit-content',
          okText: 'Delete',
          okType: 'danger',
          title: (
            <div>
              <p>Are you sure you want to delete snapshot group <strong>{record.name}</strong> ?</p>
              <p>The member snapshots of this group will be deleted along with the group.</p>
            </div>
          ),
          onOk() {
            deleteSnapshotGroup(record)
          },
        })
        break
      default:
    }
  }

  const phase = record => (record.degraded ? 'Degraded' : (record.status?.phase || record.phase))
  const canRecreate = ['Failed', 'Degraded'].includes(phase(selected))

  const availableActions = [
    { key: 'recreate', name: 'Recreate', disabled: !canRecreate },
    { key: 'delete', name: 'Delete' },
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
  deleteSnapshotGroup: PropTypes.func,
  recreateSnapshotGroup: PropTypes.func,
}

export default actions
