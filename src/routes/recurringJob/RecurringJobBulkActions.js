import React from 'react'
import PropTypes from 'prop-types'
import { Button, Modal, Alert } from 'antd'
import { withTranslation } from 'react-i18next'

const confirm = Modal.confirm

function bulkActions({ selectedRows, deleteRecurringJob, t }) {
  const handleClick = (action) => {
    switch (action) {
      case 'delete':
        confirm({
          title: t('recurringJobActions.modal.delete.title', { recurringJobName: selectedRows.map(item => item.name).join(',') }),
          content: <Alert
            description={t('recurringJobBulkActions.modal.delete.description', { recurringJobNames: selectedRows.map(item => item.name).join(',') })}
            type="warning"
          />,
          width: 760,
          onOk() {
            deleteRecurringJob(selectedRows)
          },
        })
        break
      default:
    }
  }

  const allActions = [
    { key: 'delete', name: t('common.delete'), disabled() { return selectedRows.length === 0 } },
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
  deleteRecurringJob: PropTypes.func,
  t: PropTypes.func.isRequired,
}

export default withTranslation()(bulkActions)
