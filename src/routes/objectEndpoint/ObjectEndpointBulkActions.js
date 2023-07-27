import React from 'react'
import PropTypes from 'prop-types'
import { Button, Modal, Alert } from 'antd'

const confirm = Modal.confirm

function bulkActions({ selectedRows, deleteObjectEndpoint }) {
  const handleClick = (action) => {
    switch (action) {
      case 'delete':
        confirm({
          title: `Are you sure you want to delete Object Endpoint ${selectedRows.map(item => item.name).join(',')} ?`,
          content: <Alert
            description={'Longhorn will remove the volume automatically.'}
            type="warning"
          />,
          width: 760,
          onOk() {
            deleteObjectEndpoint(selectedRows)
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
    <div>
      { allActions.map(item => {
        return (
          <div key={item.key}>
            &nbsp;
            <Button size="large" type="primary" disabled={item.disabled()} onClick={() => handleClick(item.key)}>{ item.name }</Button>
          </div>
        )
      }) }
    </div>
  )
}

bulkActions.propTypes = {
  selectedRows: PropTypes.array,
  deleteObjectEndpoint: PropTypes.func,
}

export default bulkActions
