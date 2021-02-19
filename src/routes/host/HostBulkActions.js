import React from 'react'
import PropTypes from 'prop-types'
import { Button, Modal, Tooltip } from 'antd'
import style from './HostBulkActions.less'

const confirm = Modal.confirm

function bulkActions({ selectedRows, bulkDeleteHost, commandKeyDown, showBulkEditNodeModal }) {
  const handleClick = (action) => {
    switch (action) {
      case 'delete':
        if (commandKeyDown) {
          bulkDeleteHost(selectedRows)
        } else {
          confirm({
            title: `Are you sure you want to delete node(s) ${selectedRows.map(item => item.name).join(', ')} ?`,
            onOk() {
              bulkDeleteHost(selectedRows)
            },
          })
        }
        break
      case 'editNode':
        showBulkEditNodeModal()
        break
      default:
    }
  }

  const allActions = [
    { key: 'delete',
      name: 'Delete',
      disabled() {
        return (selectedRows.length === 0 || selectedRows.some((item) => {
          if (item && item.status && item.status.key !== 'down') {
            return true
          }
          return false
        }))
      },
    },
    { key: 'editNode',
      name: 'Edit Node',
      disabled() {
        return selectedRows.length === 0 || selectedRows.some((item) => {
          if (item && item.status && item.status.key === 'down') {
            return true
          }
          return selectedRows[0].allowScheduling !== item.allowScheduling
        })
      },
    },
  ]

  const message = selectedRows.length === 0 || selectedRows.some((item) => {
    if (item && item.status && item.status.key !== 'down') {
      return true
    }
    return false
  }) ? 'Kubernetes node must be deleted first' : ''

  return (
    <div className={style.bulkActions}>
      { allActions.map(item => {
        return (
          <div key={item.key}>
            &nbsp;
            <Tooltip title={`${item.key === 'delete' ? message : ''}`}>
              <Button size="large" type="primary" disabled={item.disabled()} onClick={() => handleClick(item.key)}>{ item.name }</Button>
            </Tooltip>
          </div>
        )
      }) }
    </div>
  )
}

bulkActions.propTypes = {
  selectedRows: PropTypes.array,
  bulkDeleteHost: PropTypes.func,
  showBulkEditNodeModal: PropTypes.func,
  commandKeyDown: PropTypes.bool,
}

export default bulkActions
