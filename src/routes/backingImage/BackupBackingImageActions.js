import React from 'react'
import PropTypes from 'prop-types'
import { Modal } from 'antd'
import { DropOption } from '../../components'
import { withTranslation } from 'react-i18next'

const confirm = Modal.confirm

function BackupBackingImageBulkActions({ selected, deleteBackupBackingImage, restoreBackingImage, t }) {
  const handleMenuClick = (event, record) => {
    event.domEvent?.stopPropagation?.()
    switch (event.key) {
      case 'delete':
        confirm({
          okText: t('common.delete'),
          okType: 'danger',
          title: t('backupBackingImageActions.modal.delete.title', { backupName: record.name }),
          onOk() {
            deleteBackupBackingImage(record)
          },
        })
        break
      case 'restore':
        restoreBackingImage(record)
        break
      default:
    }
  }

  const disableRestoreAction = selected.state !== 'Completed'

  const availableActions = [
    { key: 'restore', name: t('backupBackingImageActions.actions.restore'), disabled: disableRestoreAction, tooltip: disableRestoreAction ? t('backupBackingImageActions.actions.restoreTooltip') : '' },
    { key: 'delete', name: t('common.delete') },
  ]

  return (
    <DropOption menuOptions={availableActions}
      onMenuClick={(e) => handleMenuClick(e, selected)}
    />
  )
}

BackupBackingImageBulkActions.propTypes = {
  selected: PropTypes.object,
  deleteBackupBackingImage: PropTypes.func,
  restoreBackingImage: PropTypes.func,
  t: PropTypes.func.isRequired,
}

export default withTranslation()(BackupBackingImageBulkActions)
