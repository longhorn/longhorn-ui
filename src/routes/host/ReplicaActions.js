import React from 'react'
import PropTypes from 'prop-types'
import { Button, Modal } from 'antd'
const confirm = Modal.confirm

function ReplicaActions({ selectedRows, selectedRowKeys, deleteButtonDisabled, deleteButtonLoading, deleteReplicas }) {
  const deleteButtonClick = () => {
    confirm({
      title: `Are you sure you want to delete replicas ${selectedRowKeys} ?`,
      onOk() {
        deleteReplicas(selectedRows)
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

ReplicaActions.propTypes = {
  selectedRows: PropTypes.array,
  selectedRowKeys: PropTypes.array,
  deleteButtonDisabled: PropTypes.bool,
  deleteButtonLoading: PropTypes.bool,
  deleteReplicas: PropTypes.func,
}

export default ReplicaActions
