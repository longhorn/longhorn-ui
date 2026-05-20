import React from 'react'
import PropTypes from 'prop-types'
import { Button, Modal } from 'antd'
import style from './systemBackupsBulkActions.less'
import { getAvailableBackupTargets } from '../../utils/backupTarget'
import { withTranslation } from 'react-i18next'

const confirm = Modal.confirm

function bulkActions({ selectedRows, backupProps, deleteSystemBackups, createSystemBackup, backupTarget, t }) {
  const createBtnDisable = getAvailableBackupTargets(backupTarget).length === 0
  const handleClick = (action) => {
    switch (action) {
      case 'create':
        createSystemBackup()
        break
      case 'delete':
        confirm({
          title: t('systemBackupsBulkActions.modal.delete.title', { names: selectedRows.map(item => item.name).join(',') }),
          onOk() {
            deleteSystemBackups(selectedRows)
          },
        })
        break
      default:
    }
  }

  const { backupTargetAvailable, backupTargetMessage } = backupProps
  const allActions = [
    { key: 'create', name: t('common.create'), disabled: createBtnDisable || backupTargetAvailable === false, tooltip: backupTargetAvailable === false ? backupTargetMessage : '' },
    { key: 'delete', name: t('common.delete'), disabled: selectedRows.length === 0 },
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
  backupProps: PropTypes.object,
  deleteSystemBackups: PropTypes.func,
  createSystemBackup: PropTypes.func,
  backupTarget: PropTypes.object,
  t: PropTypes.func,
}

export default withTranslation()(bulkActions)
