import React from 'react'
import PropTypes from 'prop-types'
import { Button, Modal } from 'antd'
const confirm = Modal.confirm

function DiskStateMapActions({ selectedRows, deleteButtonDisabled, deleteButtonLoading, deleteDisksOnBackingImage }) {
  const deleteButtonClick = () => {
    confirm({
      title: `Are you sure to delete the image files from the disks (${selectedRows.map(item => item.disk).join(',')}) ?`,
      onOk() {
        deleteDisksOnBackingImage(selectedRows)
      },
    })
  }

  const deleteButtonProps = {
    disabled: deleteButtonDisabled,
    loading: deleteButtonLoading,
    onClick: deleteButtonClick,
    type: 'danger',
  }

  return (
    <Button {...deleteButtonProps}>Delete</Button>
  )
}

DiskStateMapActions.propTypes = {
  selectedRows: PropTypes.array,
  deleteButtonDisabled: PropTypes.bool,
  deleteButtonLoading: PropTypes.bool,
  deleteDisksOnBackingImage: PropTypes.func,
}

export default DiskStateMapActions
