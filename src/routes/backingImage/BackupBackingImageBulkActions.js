import React from 'react'
import PropTypes from 'prop-types'
import { Button, Modal } from 'antd'

const confirm = Modal.confirm

function bulkActions({ bbiSelectedRows, deleteBackupBackingImages }) {
  const handleClick = (action) => {
    const count = bbiSelectedRows.length
    switch (action) {
      case 'delete':
        confirm({
          width: 'fit-content',
          okText: 'Delete',
          okType: 'danger',
          title: (<>
                    <p>Are you sure to delete below {count} backup backing {count === 1 ? 'image' : 'images' } ?</p>
                    <ul>
                      {bbiSelectedRows.map(item => <li>{item.name}</li>)},
                    </ul>
                  </>),
          onOk() {
            deleteBackupBackingImages(bbiSelectedRows)
          },
        })
        break
      default:
    }
  }

  const allActions = [
    { key: 'delete', name: 'Delete', disabled() { return bbiSelectedRows.length === 0 } },
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
  bbiSelectedRows: PropTypes.array,
  deleteBackupBackingImages: PropTypes.func,
}

export default bulkActions
