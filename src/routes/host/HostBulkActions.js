import React from 'react'
import PropTypes from 'prop-types'
import { Button, Tooltip } from 'antd'
import style from './HostBulkActions.less'

function bulkActions({ selectedRows, showBulkEditNodeModal }) {
  const handleClick = (action) => {
    switch (action) {
      case 'editNode':
        showBulkEditNodeModal()
        break
      default:
    }
  }

  const allActions = [
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
  showBulkEditNodeModal: PropTypes.func,
}

export default bulkActions
