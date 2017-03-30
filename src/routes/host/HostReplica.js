import React, { PropTypes } from 'react'
import { Button, Form, Modal } from 'antd'
import ReplicaList from './ReplicaList'

const modal = ({
  selected,
  visible,
  onCancel,
}) => {
  const modalOpts = {
    title: `Replicas on ${selected.name}`,
    visible,
    onCancel,
    width: 800,
    footer: [
      <Button key="submit" type="primary" size="large" onClick={onCancel}>
        OK
      </Button>,
    ],
  }

  const replicaListProps = {
    dataSource: selected.replicas,
  }

  return (
    <Modal {...modalOpts}>
      <ReplicaList {...replicaListProps} />
    </Modal>
  )
}

modal.propTypes = {
  visible: PropTypes.bool,
  onCancel: PropTypes.func,
  selected: PropTypes.object,
}

export default Form.create()(modal)
