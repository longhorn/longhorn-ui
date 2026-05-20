import React from 'react'
import PropTypes from 'prop-types'
import { Modal, Alert } from 'antd'
import { DropOption } from '../../components'
import { withTranslation } from 'react-i18next'

const confirm = Modal.confirm

function actions({ selected, deleteRecurringJob, editRecurringJob, t }) {
  const handleMenuClick = (event, record) => {
    event.domEvent?.stopPropagation?.()
    switch (event.key) {
      case 'delete':
        confirm({
          title: t('recurringJobActions.modal.delete.title', { recurringJobName: record.name }),
          content: <Alert
            description={t('recurringJobActions.modal.delete.description', { recurringJobName: record.name })}
            type="warning"
          />,
          width: 760,
          onOk() {
            deleteRecurringJob(record)
          },
        })
        break
      case 'edit':
        editRecurringJob(record)
        break
      default:
    }
  }

  const availableActions = [
    { key: 'edit', name: t('common.edit') },
    { key: 'delete', name: t('common.delete') },
  ]

  return (
    <DropOption menuOptions={availableActions}
      onMenuClick={(e) => handleMenuClick(e, selected)}
    />
  )
}

actions.propTypes = {
  selected: PropTypes.object,
  deleteRecurringJob: PropTypes.func,
  editRecurringJob: PropTypes.func,
  t: PropTypes.func.isRequired,
}

export default withTranslation()(actions)
