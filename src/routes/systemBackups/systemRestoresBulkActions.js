import React from 'react'
import PropTypes from 'prop-types'
import { Button, Modal } from 'antd'
import style from './systemBackupsBulkActions.less'

const confirm = Modal.confirm

function bulkActions({ selectedRows, deleteSystemRestores }) {
  const handleClick = (action) => {
    switch (action) {
      case 'delete':
        confirm({
          title: `Are you sure you want to delete System Restore ${selectedRows.map(item => item.name).join(',')} ?`,
          onOk() {
            deleteSystemRestores(selectedRows)
          },
        })
        break
      default:
    }
  }
  const disabled = selectedRows.length === 0
  const allActions = [
    { key: 'delete', name: 'Delete', disabled },
  ]

  return (
    <div className={style.bulkActions}>
      { allActions.map(item => {
        return (
          <div key={item.key}>
            &nbsp;
            <Button size="large" type="primary" disabled={item.disabled} onClick={() => handleClick(item.key)}>{ item.name }</Button>
          </div>
        )
      }) }
    </div>
  )
}

bulkActions.propTypes = {
  selectedRows: PropTypes.array,
  deleteSystemRestores: PropTypes.func,
}

export default bulkActions
