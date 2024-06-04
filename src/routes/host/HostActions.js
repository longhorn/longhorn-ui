import React from 'react'
import PropTypes from 'prop-types'
import { Modal } from 'antd'
import { DropOption } from '../../components'

const confirm = Modal.confirm

function actions({ selected, showEditDisksModal, deleteHost }) {
  const handleMenuClick = (event, record) => {
    event.domEvent?.stopPropagation?.()
    switch (event.key) {
      case 'editDisk':
        showEditDisksModal(record)
        break
      case 'deleteHost':
        confirm({
          title: `Are you sure you want to delete node ${selected.name}?`,
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
    name: 'Edit node and disks',
    disabled: selected.status.key === 'down',
    tooltip: selected.status.key === 'down' ? 'Node must not be down' : '',
  })

  let removeNodeTooltip = ''
  if (selected.status.key !== 'down') {
    removeNodeTooltip = 'Kubernetes node status must be down first'
  }

  menuOptions.push({
    key: 'deleteHost',
    name: 'Remove Node',
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
  selected: PropTypes.object,
  showEditDisksModal: PropTypes.func,
  deleteHost: PropTypes.func,
}

export default actions
