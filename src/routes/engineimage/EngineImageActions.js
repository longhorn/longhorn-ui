import React from 'react'
import PropTypes from 'prop-types'
import { Modal } from 'antd'
import { DropOption } from '../../components'
import { withTranslation } from 'react-i18next'

const confirm = Modal.confirm

function actions({ selected, deleteEngineImage, t }) {
  const handleMenuClick = (event, record) => {
    event.domEvent?.stopPropagation?.()
    switch (event.key) {
      case 'delete':
        confirm({
          title: t('engineImageActions.modal.delete.title', { name: record.name }),
          onOk() {
            deleteEngineImage(record)
          },
        })
        break
      default:
    }
  }

  const availableActions = [{ key: 'delete', name: t('common.delete'), disabled: selected.default }]

  return (
    <DropOption menuOptions={availableActions}
      onMenuClick={(e) => handleMenuClick(e, selected)}
    />
  )
}

actions.propTypes = {
  selected: PropTypes.object,
  deleteEngineImage: PropTypes.func,
  t: PropTypes.func,
}

export default withTranslation()(actions)
