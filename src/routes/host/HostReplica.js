import React, { PropTypes } from 'react'
import { Button, Form } from 'antd'
import ReplicaList from './ReplicaList'
import { ModalBlur } from '../../components'

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
    <ModalBlur {...modalOpts}>
      <ReplicaList {...replicaListProps} />
    </ModalBlur>
  )
}

modal.propTypes = {
  visible: PropTypes.bool,
  onCancel: PropTypes.func,
  selected: PropTypes.object,
}

export default Form.create()(modal)
