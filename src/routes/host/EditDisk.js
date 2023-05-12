import React from 'react'
import PropTypes from 'prop-types'
import { Form } from 'antd'
import { ModalBlur } from '../../components'
import EditableDiskList from './components/EditableDiskList'
import { byteToGi, giToByte } from './helper/index'

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
    const isStorageChanged = (origValue, inputValue) => {
      return byteToGi(origValue) !== byteToGi(inputValue)
    }
    validateFields({ force: true }, (errors, values) => {
      if (errors) {
        return
      }
      const storageKeys = ['storageMaximum', 'storageReserved', 'storageAvailable', 'storageScheduled']

      const deletedDiskIds = Object.keys(values.disks).filter(id => values.disks[id].deleted)
      const allowSchedulingDiskIds = Object.keys(node.disks).filter(id => node.disks[id].allowScheduling)
      const disabledSchedulingDiskIds = deletedDiskIds.filter(id => allowSchedulingDiskIds.indexOf(id) > -1)
      const updatedDisks = {}
      Object.keys(values.disks).filter(k => values.disks[k].deleted !== true).forEach(k => {
        const disk = { ...values.disks[k] }
        // disk.tags = ['ssd']
        const originDisk = node.disks[k]
        storageKeys.forEach(sk => {
          disk[sk] = giToByte(disk[sk])
        })

        if (originDisk) {
          storageKeys.forEach(sk => {
            if (!isStorageChanged(originDisk[sk], disk[sk])) {
              disk[sk] = originDisk[sk]
            }
          })
        }
        disk.name ? updatedDisks[disk.name] = disk : updatedDisks[k] = disk
      })
      let updateNode = Object.assign({}, node, {
        tags: values.tags,
        allowScheduling: values.nodeAllowScheduling,
        evictionRequested: values.evictionRequested,
        instanceManagerCPURequest: values.instanceManagerCPURequest,
      })
      if (disabledSchedulingDiskIds.length > 0) {
        const disabledSchedulingDisks = {}
        Object.keys(node.disks).forEach(id => {
          let diskItem = { ...node.disks[id], allowScheduling: disabledSchedulingDiskIds.indexOf(id) > -1 ? false : node.disks[id].allowScheduling }
          node.disks[id] && node.disks[id].name ? disabledSchedulingDisks[node.disks[id].name] = diskItem : disabledSchedulingDisks[id] = diskItem
        })
        onOk(updatedDisks, disabledSchedulingDisks, updateNode)
      } else {
        onOk(updatedDisks, false, updateNode)
      }
    })
  }

  const modalOpts = {
    title: 'Edit Node and Disks',
    visible,
    onCancel,
    onOk: handleOk,
    width: 850,
    okText: 'Save',
    style: { top: 0 },
  }

  const EditableDiskListProps = {
    form,
    node,
  }

  return (
    <ModalBlur {...modalOpts}>
      {visible ? <EditableDiskList {...EditableDiskListProps} /> : ''}
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
