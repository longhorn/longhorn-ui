import React from 'react'
import PropTypes from 'prop-types'
import { Modal, Alert, Icon } from 'antd'
import { DropOption } from '../../components'
import { withTranslation } from 'react-i18next'

const confirm = Modal.confirm

function actions({ selected, deleteSystemRestore, t }) {
  const handleMenuClick = (event, record) => {
    event.domEvent?.stopPropagation?.()
    let title = <div><Icon style={{ marginRight: 5 }} className="color-warning" type="info-circle" />{t('systemRestoresAction.modal.delete.title.default', { name: record.name })}</div>
    if (record.state === 'Pending' || record.state === 'Restoring' || record.state === 'Downloading') {
      title = (<div>
        <div style={{ marginBottom: 10 }}><Icon style={{ marginRight: 5 }} className="color-warning" type="info-circle" />{t('systemRestoresAction.modal.delete.title.inProgress', { name: record.name })}</div>
        <Alert
          message={t('systemRestoresAction.modal.delete.warningMessage')}
          type="warning"
        />
      </div>)
    }
    switch (event.key) {
      case 'delete':
        confirm({
          width: 600,
          icon: '',
          title,
          onOk() {
            deleteSystemRestore(record)
          },
        })
        break
      default:
    }
  }

  const availableActions = [
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
  deleteSystemRestore: PropTypes.func,
  t: PropTypes.func,
}

export default withTranslation()(actions)
