import React from 'react'
import PropTypes from 'prop-types'
import { Button, Modal, Alert, Icon } from 'antd'
import style from './systemBackupsBulkActions.less'

const confirm = Modal.confirm

function bulkActions({ selectedRows, deleteSystemRestores }) {
  const handleClick = (action) => {
    let title = <div><Icon style={{ marginRight: 5 }} className="color-warning" type="info-circle" />Are you sure you want to delete System Restore {selectedRows.map(item => item.name).join(',')} ?</div>
    let restoring = selectedRows.some((item) => item.state === 'Pending' || item.state === 'Restoring' || item.state === 'Downloading')
    if (restoring) {
      title = (<div>
        <div style={{ marginBottom: 10 }}><Icon style={{ marginRight: 5 }} className="color-warning" type="info-circle" />Are you sure you want to delete System Restore {selectedRows.map(item => item.name).join(',')}</div>
        <Alert
          message={'Deleting restoring system backup will abort the remaining resource rollout. An incomplete restore may cause Longhorn system resource inconsistencies leading to unexpected behavior.'}
          type="warning"
        />
      </div>)
    }
    switch (action) {
      case 'delete':
        confirm({
          title,
          width: 600,
          icon: '',
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
