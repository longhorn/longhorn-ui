import React from 'react'
import PropTypes from 'prop-types'
import { Button, Modal } from 'antd'
const confirm = Modal.confirm

function DiskStateMapActions({ selectedRows, deleteButtonDisabled, deleteButtonLoading, deleteDisksOnBackingImage }) {
  const deleteButtonClick = () => {
    confirm({
      width: 'fit-content',
      title: (
          <>
            <p>Are you sure you want to remove the image file from the disks ?</p>
            <ul>
              {selectedRows.map(item => <li>{item.disk}</li>)}
            </ul>
          </>
      ),
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
    <Button {...deleteButtonProps}>Clean Up</Button>
  )
}

DiskStateMapActions.propTypes = {
  selectedRows: PropTypes.array,
  deleteButtonDisabled: PropTypes.bool,
  deleteButtonLoading: PropTypes.bool,
  deleteDisksOnBackingImage: PropTypes.func,
}

export default DiskStateMapActions
