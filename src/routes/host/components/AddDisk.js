import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import DistTag from './TagComponent.js'
import { Form, Input, Modal, Radio, Select } from 'antd'
import { byteToGi, giToByte } from '../helper/index'
import StorageInput from './StorageInput'
import PathInput from './PathInput'
import styles from './EditableDiskItem.less'
const FormItem = Form.Item
const RadioGroup = Radio.Group
const Option = Select.Option

const modal = ({
  items,
  nodes,
  visible,
  onCancel,
  onOk,
  form: {
    getFieldDecorator,
    validateFields,
    getFieldsValue,
    setFieldsValue,
  },
}) => {
  function handleOk() {
    validateFields((errors) => {
      if (errors) {
        return
      }
      const data = {
        ...getFieldsValue(),
      }
      data.storageReserved = giToByte(parseInt(data.storageReserved, 10))
      onOk(data)
    })
  }

  const disk = {
    name: '',
    path: '',
    nodeID: '',
    storageMaximum: 0,
    storageAvailable: 0,
    storageReserved: 0,
    storageScheduled: 0,
    allowScheduling: true,
    evictionRequested: false,
    tags: [],
  }

  const modalOpts = {
    title: 'Add Disk',
    visible,
    onCancel,
    width: 850,
    onOk: handleOk,
  }

  const validateName = (rule, value, callback) => {
    let reg = /^[a-zA-Z0-9][a-zA-Z0-9_.-]+$/
    if (!reg.test(value)) {
      callback('The input is not valid Name')
    }
    if (value && items.filter(d => d.name === value).length > 1) {
      callback('This name already exists')
    } else {
      callback()
    }
  }

  return (
    <Modal {...modalOpts}>
      <div style={{ position: 'relative' }} className={classnames(styles.ediableDisk)}>
        <div style={{ width: '100%', padding: '0px 15px', lineHeight: '40px' }}>
          {getFieldDecorator('tags', {
            initialValue: disk.tags,
          })(<DistTag tags={disk.tags} changeTags={(tags) => { setFieldsValue({ tags }) }} />)}
        </div>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
          <div className={styles.formItem} style={{ width: '30%' }}>
            <div className={styles.label}>
              Storage Available
            </div>
            <div className={styles.control} style={{ padding: '5px 15px' }}>
              {byteToGi(disk.storageAvailable)}Gi
            </div>
          </div>
          <div className={styles.formItem} style={{ width: '30%' }}>
            <div className={styles.label}>
              Storage Scheduled
            </div>
            <div className={styles.control} style={{ padding: '5px 15px' }}>
            {byteToGi(disk.storageScheduled)}Gi
            </div>
          </div>
          <div className={styles.formItem} style={{ width: '30%' }}>
            <div className={styles.label}>
              Storage Max
            </div>
            <div className={styles.control} style={{ padding: '5px 15px' }}>
            {byteToGi(disk.storageMaximum)}Gi
            </div>
          </div>
        </div>
        <div className={styles.formItem} style={{ width: '109%' }}>
          <div className={styles.control}>
            <div className={styles.label}>
              Node ID
            </div>
            <FormItem style={{ margin: 0 }}>
              {getFieldDecorator('nodeID', {
                initialValue: disk.name,
                rules: [{
                  required: true,
                  message: 'Please Input Path!',
                }],
              })(
                <Select style={{ width: '100%' }}>
                  {nodes.map(node => (<Option key={node.id} value={node.id}>{node.id}</Option>))}
                </Select>
              )}
            </FormItem>
          </div>
          <div className={styles.control}>
            <div className={styles.label}>
              Name
            </div>
            <FormItem style={{ margin: 0 }}>
              {getFieldDecorator('name', {
                initialValue: disk.name,
                rules: [{
                  required: true,
                  message: 'Please Input Path!',
                }, {
                  validator: validateName,
                }],
              })(<Input />)}
            </FormItem>
          </div>
          <div className={styles.control}>
            <div className={styles.label}>
              Path
            </div>
            <FormItem style={{ margin: 0 }}>
              {getFieldDecorator('path', {
                rules: [{
                  required: true,
                  message: 'Please Input Path!',
                }],
                initialValue: disk.path,
              })(<PathInput
                placeholder="Path mounted by the disk, e.g. /mnt/disk1"
                />)}
            </FormItem>
          </div>
        </div>
        <div className={styles.formItem}>
          <div className={styles.label}>
            Storage Reserved
          </div>
          <div className={styles.control}>
            <FormItem style={{ margin: 0 }}>
              {getFieldDecorator('storageReserved', {
                initialValue: byteToGi(disk.storageReserved),
              })(<span>
                <StorageInput min={0} defaultValue={byteToGi(disk.storageReserved)} />
              </span>)}
            </FormItem>
          </div>
        </div>
        <div className={styles.formItem}>
          <div className={styles.label}>
            Scheduling
          </div>
          <div className={styles.control} style={{ width: '210px' }}>
            <FormItem style={{ margin: '3px 0px 0px 0px' }}>
              {getFieldDecorator('allowScheduling', {
                initialValue: disk.allowScheduling,
              })(
                <RadioGroup disabled={disk.deleted}>
                  <Radio value>Enable</Radio>
                  <Radio value={false}>Disable</Radio>
                </RadioGroup>
              )}
            </FormItem>
          </div>
        </div>
        <div className={styles.formItem}>
          <div className={styles.label}>
            Eviction Requested
          </div>
          <div className={styles.control} style={{ width: '210px' }}>
            <FormItem style={{ margin: '3px 0px 0px 0px' }}>
              {getFieldDecorator('evictionRequested', {
                initialValue: disk.evictionRequested,
              })(
                <RadioGroup disabled={disk.deleted}>
                  <Radio value={true}>True</Radio>
                  <Radio value={false}>False</Radio>
                </RadioGroup>
              )}
            </FormItem>
          </div>
        </div>
      </div>
    </Modal>
  )
}

modal.propTypes = {
  form: PropTypes.object.isRequired,
  visible: PropTypes.bool,
  onCancel: PropTypes.func,
  items: PropTypes.array,
  nodes: PropTypes.array,
  onOk: PropTypes.func,
}

export default Form.create()(modal)
