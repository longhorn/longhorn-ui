import React from 'react'
import PropTypes from 'prop-types'
import { Button, Form } from 'antd'
import ReplicaActions from './ReplicaActions'
import ReplicaList from './ReplicaList'
import { ModalBlur } from '../../components'

const modal = ({
  selected,
  visible,
  onCancel,
  deleteReplicas,
  selectedRows,
  selectedRowKeys,
  rowSelection,
  replicaModalDeleteDisabled,
  replicaModalDeleteLoading,
}) => {
  const modalOpts = {
    title: `Replicas on ${selected.name}`,
    visible,
    onCancel,
    width: 800,
    footer: [
      <Button key="submit" size="large" onClick={onCancel}>
        Close
      </Button>,
    ],
  }

  const replicaActionsProps = {
    selectedRows,
    selectedRowKeys,
    deleteButtonDisabled: replicaModalDeleteDisabled,
    deleteButtonLoading: replicaModalDeleteLoading,
    deleteReplicas,
  }

  const replicaListProps = {
    dataSource: selected.replicas,
    deleteReplicas,
    rowSelection,
  }

  return (
    <ModalBlur {...modalOpts}>
      <div style={{ marginBottom: 12 }}>
        <ReplicaActions {...replicaActionsProps} />
      </div>
      <ReplicaList {...replicaListProps} />
    </ModalBlur>
  )
}

modal.propTypes = {
  visible: PropTypes.bool,
  onCancel: PropTypes.func,
  selected: PropTypes.object,
  deleteReplicas: PropTypes.func,
  selectedRows: PropTypes.array,
  selectedRowKeys: PropTypes.array,
  rowSelection: PropTypes.object,
  replicaModalDeleteDisabled: PropTypes.bool,
  replicaModalDeleteLoading: PropTypes.bool,
}

export default Form.create()(modal)
