import React from 'react'
import PropTypes from 'prop-types'
import { Button, Modal } from 'antd'
const confirm = Modal.confirm

function bulkActions({ selectedRows, bulkDeleteBackupTargets }) {
  const handleClick = (action) => {
    const count = selectedRows.length
    switch (action) {
      case 'delete':
        confirm({
          width: 'fit-content',
          okText: 'Delete',
          okType: 'danger',
          title: (<>
                    <p>Are you sure to you want to delete below {count} backup {count === 1 ? 'target' : 'targets' } ?</p>
                    <ul>
                      {selectedRows.map(item => <li key={item.name}>{item.name}</li>)}
                    </ul>
                  </>),
          onOk() {
            bulkDeleteBackupTargets(selectedRows)
          },
        })
        break
      default:
    }
  }

  const allActions = [
    { key: 'delete', name: 'Delete', disabled() { return selectedRows.length === 0 || selectedRows.every(row => row.name === 'default') } },
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
  bulkDeleteBackupTargets: PropTypes.func,
}

export default bulkActions
