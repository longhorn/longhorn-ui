import React from 'react'
import PropTypes from 'prop-types'
import { Modal } from 'antd'
import { DropOption } from '../../components'
import { hasReadyBackingDisk } from '../../utils/status'
import { withTranslation } from 'react-i18next'

const confirm = Modal.confirm

function actions({
  selected,
  backupProps,
  deleteBackingImage,
  downloadBackingImage,
  showUpdateMinCopiesCount,
  openBackupBackingImageModal,
  t,
}) {
  const { backupTargetAvailable, backupTargetMessage } = backupProps

  const handleMenuClick = (event, record) => {
    event.domEvent?.stopPropagation?.()
    switch (event.key) {
      case 'delete':
        confirm({
          okText: t('common.delete'),
          okType: 'danger',
          title: t('backingImageActions.modal.delete.title', { name: record.name }),
          onOk() {
            deleteBackingImage(record)
          },
        })
        break
      case 'download':
        downloadBackingImage(record)
        break
      case 'updateMinCopies':
        showUpdateMinCopiesCount(record)
        break
      case 'backup': {
        openBackupBackingImageModal(record)
        break
      }
      default:
    }
  }

  const disableAction = !hasReadyBackingDisk(selected)
  const getBackupActionTooltip = () => {
    if (!backupTargetAvailable) {
      return backupTargetMessage
    }
    return disableAction ? t('backingImageActions.tooltips.missingReadyDisk') : ''
  }

  const availableActions = [
    {
      key: 'updateMinCopies',
      name: t('backingImageActions.actions.updateMinCopies'),
      disabled: disableAction,
      tooltip: disableAction ? t('backingImageActions.tooltips.missingReadyDisk') : ''
    },
    {
      key: 'backup',
      name: t('backingImageActions.actions.backup'),
      disabled: disableAction || backupTargetAvailable === false,
      tooltip: getBackupActionTooltip()
    },
    {
      key: 'download',
      name: t('backingImageActions.actions.download'),
      disabled: disableAction || selected.dataEngine === 'v2',
      tooltip: disableAction ? t('backingImageActions.tooltips.missingReadyDisk') : ''
    },
    {
      key: 'delete',
      name: t('common.delete')
    },
  ]

  return (
    <DropOption menuOptions={availableActions}
      onMenuClick={(e) => handleMenuClick(e, selected)}
    />
  )
}

actions.propTypes = {
  selected: PropTypes.object,
  deleteBackingImage: PropTypes.func,
  downloadBackingImage: PropTypes.func,
  showUpdateMinCopiesCount: PropTypes.func,
  backupProps: PropTypes.object,
  openBackupBackingImageModal: PropTypes.func,
  t: PropTypes.func,
}

export default withTranslation()(actions)
