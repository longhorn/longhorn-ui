import React, { PropTypes } from 'react'
import { Form } from 'antd'
import { ModalBlur } from '../../components'
import EditableDiskList from './components/EditableDiskList'
import { formatMib } from '../../utils/formater'

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
    const gibToByte = (value) => {
      return parseFloat(value, 10) * 1024 * 1024 * 1024
    }
    const isStorageChanged = (origValue, inputValue) => {
      return formatMib(origValue) !== formatMib(inputValue)
    }
    validateFields({ force: true }, (errors, values) => {
      if (errors) {
        return
      }

      const storageKeys = ['storageMaximum', 'storageReserved', 'storageAvailable', 'storageScheduled']

      const deletedDiskIds = Object.keys(values.disks).filter(id => values.disks[id].deleted)
      const allowSchedulingDiskIds = Object.keys(node.disks).filter(id => node.disks[id].allowScheduling)
      const disabledSchedulingDiskIds = deletedDiskIds.filter(id => allowSchedulingDiskIds.indexOf(id) > -1)
      const updatedDisks = Object.keys(values.disks).filter(k => values.disks[k].deleted !== true).map(k => {
        const disk = { ...values.disks[k] }
        const originDisk = node.disks[k]
        storageKeys.forEach(sk => {
          disk[sk] = gibToByte(disk[sk])
        })

        if (originDisk) {
          storageKeys.forEach(sk => {
            if (!isStorageChanged(originDisk[sk], disk[sk])) {
              disk[sk] = originDisk[sk]
            }
          })
        }
        return disk
      })

      if (disabledSchedulingDiskIds.length > 0) {
        const disabledSchedulingDisks = Object.keys(node.disks).map(id => {
          return { ...node.disks[id], allowScheduling: disabledSchedulingDiskIds.indexOf(id) > -1 ? false : node.disks[id].allowScheduling }
        })
        onOk(updatedDisks, disabledSchedulingDisks)
      } else {
        onOk(updatedDisks)
      }
    })
  }

  const modalOpts = {
    title: 'Disks',
    visible,
    onCancel,
    onOk: handleOk,
    width: 1300,
    okText: 'Save',
  }

  const EditableDiskListProps = {
    form,
    node,
  }

  return (
    <ModalBlur {...modalOpts}>
      <EditableDiskList {...EditableDiskListProps} />
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
