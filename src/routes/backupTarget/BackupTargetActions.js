import React from 'react'
import PropTypes from 'prop-types'
import { Modal } from 'antd'
import { DropOption } from '../../components'
import { withTranslation } from 'react-i18next'

const confirm = Modal.confirm

function actions({ selected, deleteBackupTarget, editBackupTarget, t }) {
  const handleMenuClick = (event, record) => {
    event.domEvent?.stopPropagation?.()
    switch (event.key) {
      case 'edit':
        editBackupTarget(record)
        break
      case 'delete':
        confirm({
          width: 'fit-content',
          okText: t('common.delete'),
          okType: 'danger',
          title: <p>{t('backupTargetActions.modal.delete.title', { backupTargetName: record.name })}</p>,
          onOk() {
            deleteBackupTarget(record)
          },
        })
        break
      default:
    }
  }

  const deleteActions = ({
    disabled: selected.name === 'default',
    tooltip: selected.name === 'default' ? t('backupTargetActions.deleteTooltip.defaultTarget') : '',
  })

  const availableActions = [
    { key: 'edit', name: t('common.edit') },
    {
      key: 'delete',
      name: t('common.delete'),
      disabled: deleteActions.disabled,
      tooltip: deleteActions.tooltip
    }
  ]

  return (
    <DropOption
      menuOptions={availableActions}
      onMenuClick={(e) => handleMenuClick(e, selected)}
    />
  )
}

actions.propTypes = {
  selected: PropTypes.object,
  deleteBackupTarget: PropTypes.func,
  editBackupTarget: PropTypes.func,
  t: PropTypes.func.isRequired,
}

export default withTranslation()(actions)
