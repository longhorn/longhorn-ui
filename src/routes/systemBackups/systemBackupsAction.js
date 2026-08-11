import React from 'react'
import PropTypes from 'prop-types'
import { Modal } from 'antd'
import { DropOption } from '../../components'
import { withTranslation } from 'react-i18next'

const confirm = Modal.confirm

function actions({ selected, deleteSystemBackup, createSystemRestore, t }) {
  const handleMenuClick = (event, record) => {
    event.domEvent?.stopPropagation?.()
    switch (event.key) {
      case 'delete':
        confirm({
          title: t('systemBackupsAction.modal.delete.title', { name: record.name }),
          onOk() {
            deleteSystemBackup({ name: record.id })
          },
        })
        break
      case 'restore':
        createSystemRestore(record)
        break
      default:
    }
  }

  const availableActions = [
    { key: 'delete', name: t('common.delete') },
    { key: 'restore', name: t('systemBackupsAction.actions.restore') },
  ]

  return (
    <DropOption menuOptions={availableActions}
      onMenuClick={(e) => handleMenuClick(e, selected)}
    />
  )
}

actions.propTypes = {
  selected: PropTypes.object,
  deleteSystemBackup: PropTypes.func,
  createSystemRestore: PropTypes.func,
  t: PropTypes.func,
}

export default withTranslation()(actions)
