import React from 'react'
import PropTypes from 'prop-types'
import { Modal, Alert } from 'antd'
import { DropOption } from '../../components'
import { isObjectStoreAdministrable, isObjectStoreDeletable, isObjectStoreEditable } from './helper'

const confirm = Modal.confirm

function actions({
  selected,
  editObjectStore,
  stopStartObjectStore,
  deleteObjectStore,
  administrateObjectStore,
}) {
  const handleMenuClick = (event, record) => {
    // Stop event propagation, otherwise the click will be processed by
    // other UI components, e.g. the table row below the clicked menu,
    // which is not wanted in that case.
    event.domEvent.stopPropagation()

    switch (event.key) {
      case 'delete':
        confirm({
          title: `Are you sure you want to delete Object Store ${record.name} ?`,
          content: <Alert
            description={`Longhorn will delete the volume associated with ${record.name} automatically.`}
            type="warning"
          />,
          width: 760,
          onOk() {
            deleteObjectStore(record)
          },
        })
        break
      case 'edit':
        editObjectStore(record)
        break
      case 'stopstart':
        stopStartObjectStore(record)
        break
      case 'administrate':
        administrateObjectStore(record)
        break
      default:
    }
  }

  const stopStartName = (record) => {
    switch (record.state) {
      case 'stopped':
        return 'Start'
      default:
        return 'Stop'
    }
  }

  const availableActions = [
    { key: 'edit', name: 'Edit', disabled: !isObjectStoreEditable(selected) },
    { key: 'stopstart', name: stopStartName(selected), disabled: !isObjectStoreEditable(selected) },
    { key: 'delete', name: 'Delete', disabled: !isObjectStoreDeletable(selected) },
    { type: 'divider' },
    { key: 'administrate', name: 'Administrate', disabled: !isObjectStoreAdministrable(selected) },
  ]

  return (
    <DropOption menuOptions={availableActions}
      onMenuClick={(e) => handleMenuClick(e, selected)}
    />
  )
}

actions.propTypes = {
  selected: PropTypes.object,
  editObjectStore: PropTypes.func,
  stopStartObjectStore: PropTypes.func,
  administrateObjectStore: PropTypes.func,
  deleteObjectStore: PropTypes.func,
}

export default actions
