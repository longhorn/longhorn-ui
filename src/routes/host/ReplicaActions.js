import React from 'react'
import PropTypes from 'prop-types'
import { Button, Modal } from 'antd'
import { withTranslation } from 'react-i18next'

const confirm = Modal.confirm

function ReplicaActions({ selectedRows, selectedRowKeys, deleteButtonDisabled, deleteButtonLoading, deleteReplicas, t }) {
  const deleteButtonClick = () => {
    confirm({
      title: t('replicaActions.deleteConfirm', { replicas: selectedRowKeys.join(', ') }),
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
    <Button {...deleteButtonProps}>{t('common.delete')}</Button>
  )
}

ReplicaActions.propTypes = {
  selectedRows: PropTypes.array,
  selectedRowKeys: PropTypes.array,
  deleteButtonDisabled: PropTypes.bool,
  deleteButtonLoading: PropTypes.bool,
  deleteReplicas: PropTypes.func,
  t: PropTypes.func,
}

export default withTranslation()(ReplicaActions)
