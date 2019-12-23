import React from 'react'
import PropTypes from 'prop-types'
import { Button } from 'antd'
import style from './BackupBulkActions.less'

function bulkActions({ selectedRows, restoreLatestBackup }) {
  const handleClick = (action) => {
    switch (action) {
      case 'restoreLatestBackup':
        restoreLatestBackup(selectedRows)
        break
      default:
    }
  }

  const allActions = [
    { key: 'restoreLatestBackup', name: 'Restore Latest Backup', disabled() { return selectedRows.length === 0 } },
  ]

  return (
    <div className={style.bulkActions}>
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
  restoreLatestBackup: PropTypes.func,
}

export default bulkActions
