import React, { PropTypes } from 'react'
import { Button, Form } from 'antd'
import ReplicaList from './ReplicaList'
import { ModalBlur } from '../../components'

const modal = ({
  selected,
  visible,
  onCancel,
  deleteReplica,
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

  const replicaListProps = {
    dataSource: selected.replicas,
    deleteReplica,
  }

  return (
    <ModalBlur {...modalOpts}>
      <ReplicaList {...replicaListProps} />
    </ModalBlur>
  )
}

modal.propTypes = {
  visible: PropTypes.bool,
  onCancel: PropTypes.func,
  selected: PropTypes.object,
  deleteReplica: PropTypes.func,
}

export default Form.create()(modal)
