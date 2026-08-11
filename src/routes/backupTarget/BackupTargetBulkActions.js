import React from 'react'
import PropTypes from 'prop-types'
import { Button, Modal } from 'antd'
import { withTranslation } from 'react-i18next'

const confirm = Modal.confirm

function bulkActions({ selectedRows, bulkDeleteBackupTargets, t }) {
  const handleClick = (action) => {
    const count = selectedRows.length
    switch (action) {
      case 'delete':
        confirm({
          width: 'fit-content',
          okText: t('common.delete'),
          okType: 'danger',
          title: (<>
                    <p>{t('backupTargetBulkActions.modal.delete.title', {
                      count
                    })}</p>
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
    { key: 'delete', name: t('common.delete'), disabled() { return selectedRows.length === 0 || selectedRows.every(row => row.name === 'default') } },
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
  t: PropTypes.func.isRequired,
}

export default withTranslation()(bulkActions)
