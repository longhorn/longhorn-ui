import React from 'react'
import PropTypes from 'prop-types'
import { Form } from 'antd'
import { ModalBlur } from '../../components'
import EditableNode from './components/EditableNode'

const modal = ({
  form,
  node,
  visible,
  onCancel,
  onOk,
}) => {
  if (!node) {
    return null
  }
  function handleOk() {
    const { validateFields } = form
    validateFields({ force: true }, (errors, values) => {
      if (errors) {
        return
      }

      let updateNode = Object.assign({}, node, { tags: values.tags, allowScheduling: values.nodeAllowScheduling, evictionRequested: values.evictionRequested })

      onOk(updateNode)
    })
  }

  const modalOpts = {
    title: 'Edit Node',
    visible,
    onCancel,
    onOk: handleOk,
    width: 650,
    okText: 'Save',
  }

  const editableNode = {
    form,
    node,
  }

  return (
    <ModalBlur {...modalOpts}>
      {visible ? <EditableNode {...editableNode} /> : ''}
    </ModalBlur>
  )
}

modal.propTypes = {
  form: PropTypes.object.isRequired,
  node: PropTypes.object,
  visible: PropTypes.bool,
  onCancel: PropTypes.func,
  onOk: PropTypes.func,
}

export default Form.create()(modal)
