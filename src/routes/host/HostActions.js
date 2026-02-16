import React from 'react'
import PropTypes from 'prop-types'
import { Modal } from 'antd'
import { DropOption } from '../../components'
import { withTranslation } from 'react-i18next'

const confirm = Modal.confirm

function actions({ selected, showEditDisksModal, deleteHost, t }) {
  const handleMenuClick = (event, record) => {
    event.domEvent?.stopPropagation?.()
    switch (event.key) {
      case 'editDisk':
        showEditDisksModal(record)
        break
      case 'deleteHost':
        confirm({
          title: t('hostActions.confirm.deleteTitle', { name: selected.name }),
          onOk() {
            deleteHost(record)
          },
        })
        break
      default:
    }
  }
  const menuOptions = []

  menuOptions.push({
    key: 'editDisk',
    name: t('hostActions.menu.editNodeAndDisks'),
    disabled: selected.status.key === 'down',
    tooltip: selected.status.key === 'down' ? t('hostActions.menu.nodeMustNotBeDown') : '',
  })

  let removeNodeTooltip = ''
  if (selected.status.key !== 'down') {
    removeNodeTooltip = t('hostActions.menu.nodeMustBeDown')
  }

  menuOptions.push({
    key: 'deleteHost',
    name: t('hostActions.menu.removeNode'),
    disabled: removeNodeTooltip !== '',
    tooltip: removeNodeTooltip,
  })

  const tooltipProps = { placement: 'left' }
  return (
    <DropOption
      menuOptions={menuOptions}
      tooltipProps={tooltipProps}
      onMenuClick={(e) => handleMenuClick(e, selected)}
    />
  )
}

actions.propTypes = {
  t: PropTypes.func,
  selected: PropTypes.object,
  showEditDisksModal: PropTypes.func,
  deleteHost: PropTypes.func,
}

export default withTranslation()(actions)
