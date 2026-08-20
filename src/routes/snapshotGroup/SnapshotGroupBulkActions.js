import React from 'react'
import PropTypes from 'prop-types'
import { Button, Modal } from 'antd'
const confirm = Modal.confirm

function bulkActions({ selectedRows, bulkDeleteSnapshotGroups }) {
  const handleClick = (action) => {
    const count = selectedRows.length
    switch (action) {
      case 'delete':
        confirm({
          width: 'fit-content',
          okText: 'Delete',
          okType: 'danger',
          title: (<>
                    <p>Are you sure you want to delete the below {count} snapshot {count === 1 ? 'group' : 'groups'} ?</p>
                    <p>The member snapshots of the {count === 1 ? 'group' : 'groups'} will be deleted along with the {count === 1 ? 'group' : 'groups'}.</p>
                    <ul>
                      {selectedRows.map(item => <li key={item.name}>{item.name}</li>)}
                    </ul>
                  </>),
          onOk() {
            bulkDeleteSnapshotGroups(selectedRows)
          },
        })
        break
      default:
    }
  }

  const allActions = [
    { key: 'delete', name: 'Delete', disabled() { return selectedRows.length === 0 } },
  ]

  return (
    <div style={{ display: 'flex' }}>
      { allActions.map(item => {
        return (
          <div key={item.key} style={{ marginRight: '10px' }}>
            <Button size="large" type="primary" disabled={item.disabled()} onClick={() => handleClick(item.key)}>{ item.name }</Button>
          </div>
        )
      }) }
    </div>
  )
}

bulkActions.propTypes = {
  selectedRows: PropTypes.array,
  bulkDeleteSnapshotGroups: PropTypes.func,
}

export default bulkActions
