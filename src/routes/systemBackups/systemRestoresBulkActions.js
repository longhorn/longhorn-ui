import React from 'react'
import PropTypes from 'prop-types'
import { Button, Modal, Alert, Icon } from 'antd'
import style from './systemBackupsBulkActions.less'
import { withTranslation } from 'react-i18next'

const confirm = Modal.confirm

function bulkActions({ selectedRows, deleteSystemRestores, t }) {
  const handleClick = (action) => {
    let title = <div><Icon style={{ marginRight: 5 }} className="color-warning" type="info-circle" />{t('systemRestoresAction.modal.delete.title.default', { name: selectedRows.map(item => item.name).join(',') })}</div>
    let restoring = selectedRows.some((item) => item.state === 'Pending' || item.state === 'Restoring' || item.state === 'Downloading')
    if (restoring) {
      title = (<div>
        <div style={{ marginBottom: 10 }}><Icon style={{ marginRight: 5 }} className="color-warning" type="info-circle" />{t('systemRestoresAction.modal.delete.title.inProgress', { name: selectedRows.map(item => item.name).join(',') })}</div>
        <Alert
          message={t('systemRestoresAction.modal.delete.warningMessage')}
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
    { key: 'delete', name: t('common.delete'), disabled },
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
  t: PropTypes.func,
}

export default withTranslation()(bulkActions)
