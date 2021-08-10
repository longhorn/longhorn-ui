import React from 'react'
import PropTypes from 'prop-types'
import { Modal } from 'antd'
import { DropOption } from '../../components'
const confirm = Modal.confirm

function actions({ selected, deleteBackingImage, cleanUpDiskMap }) {
  const handleMenuClick = (event, record) => {
    switch (event.key) {
      case 'delete':
        confirm({
          title: `Are you sure you want to delete backing image ${record.name} ?`,
          onOk() {
            deleteBackingImage(record)
          },
        })
        break
      case 'cleanUp':
        cleanUpDiskMap(record)
        break
      default:
    }
  }

  const availableActions = [
    { key: 'delete', name: 'Delete' },
    { key: 'cleanUp', name: 'Clean Up' },
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
  cleanUpDiskMap: PropTypes.func,
}

export default actions
