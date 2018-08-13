import React, { PropTypes } from 'react'
import styles from './EditableDiskItem.less'
import { Radio, Checkbox, Form, Tooltip } from 'antd'
import StorageInput from './StorageInput'
import IconRemove from './IconRemove'
import IconRestore from './IconRestore'
import classnames from 'classnames'
import PathInput from './PathInput'
import { byteToGi } from '../helper/index'

const FormItem = Form.Item
const RadioGroup = Radio.Group

function EditableDiskItem({ isNew, disk, form, onRestore, onRemove, validatePath = f => f }) {
  const { getFieldDecorator, getFieldsValue } = form
  const canBeRemoved = () => {
    return disk.storageScheduled === 0 && getFieldsValue().disks[disk.id].allowScheduling === false
  }
  const genActionButton = () => {
    if (disk.deleted) {
      return (<a onClick={() => onRestore(disk.id)} ><IconRestore /></a>)
    } else if (canBeRemoved()) {
      return (<a onClick={() => onRemove(disk.id)} ><IconRemove /></a>)
    }
    return <Tooltip placement="top" title="Only the disk with disabled scheduling and no storage scheduled can be deleted"><IconRemove disabled /></Tooltip>
  }

  return (
    <div className={classnames(styles.ediableDisk, { [styles.rowDeleted]: disk.deleted })}>
      <div className={styles.formItem} style={{ width: '450px' }}>
        <div className={styles.label}>
          Path
        </div>
        <div className={styles.control}>
          <FormItem style={{ margin: 0 }}>
            {getFieldDecorator(`disks['${disk.id}']['path']`, {
              rules: [{
                required: true,
                message: 'Please Input Path!',
              }, {
                validator: validatePath,
              }],
              initialValue: disk.path,
            })(<PathInput
              placeholder="Path mounted by the disk, e.g. /mnt/disk1" readOnly={disk.deleted || !isNew} />)}
          </FormItem>
        </div>
      </div>
      <div className={styles.formItem}>
        <div className={styles.label}>
          Storage Available
        </div>
        <div className={styles.control}>
          <FormItem style={{ margin: 0 }}>
            {getFieldDecorator(`disks['${disk.id}']['storageAvailable']`, {
              initialValue: byteToGi(disk.storageAvailable),
            })(<span>
              <StorageInput min={0} defaultValue={byteToGi(disk.storageAvailable)} readOnly />
            </span>)}
          </FormItem>
        </div>
      </div>
      <div className={styles.formItem}>
        <div className={styles.label}>
          Storage Max
        </div>
        <div className={styles.control}>
          <FormItem style={{ margin: 0 }}>
            {getFieldDecorator(`disks['${disk.id}']['storageMaximum']`, {
              initialValue: byteToGi(disk.storageMaximum),
            })(<span>
              <StorageInput min={0} defaultValue={byteToGi(disk.storageMaximum)} readOnly />
            </span>)}
          </FormItem>
        </div>
      </div>
      <div className={styles.formItem}>
        <div className={styles.label}>
          Storage Reserved
        </div>
        <div className={styles.control}>
          <FormItem style={{ margin: 0 }}>
            {getFieldDecorator(`disks['${disk.id}']['storageReserved']`, {
              initialValue: byteToGi(disk.storageReserved),
            })(<span>
              <StorageInput min={0} defaultValue={byteToGi(disk.storageReserved)} readOnly={disk.deleted} />
            </span>)}
          </FormItem>
        </div>
      </div>
      <div className={styles.formItem}>
        <div className={styles.label}>
          Storage Scheduled
        </div>
        <div className={styles.control}>
          <FormItem style={{ margin: 0 }}>
            {getFieldDecorator(`disks['${disk.id}']['storageScheduled']`, {
              initialValue: byteToGi(disk.storageScheduled),
            })(<span>
              <StorageInput min={0} defaultValue={byteToGi(disk.storageScheduled)} readOnly />
            </span>)}
          </FormItem>
        </div>
      </div>
      <div className={styles.formItem}>
        <div className={styles.label}>
          Scheduling
        </div>
        <div className={styles.control} style={{ width: '210px' }}>
          <FormItem style={{ margin: 0 }}>
            {getFieldDecorator(`disks['${disk.id}']['allowScheduling']`, {
              initialValue: disk.allowScheduling,
            })(
              <RadioGroup disabled={disk.deleted} >
                <Radio value>Enable</Radio>
                <Radio value={false}>Disable</Radio>
              </RadioGroup>
            )}
          </FormItem>
        </div>
      </div>
      <div className={styles.formItem} style={{ width: '66px' }}>
        <div className={styles.label}>
        &nbsp;
        </div>
        <div className={styles.control}>
          <FormItem style={{ margin: 0 }}>
            {getFieldDecorator(`disks['${disk.id}']['deleted']`, {
              initialValue: !!disk.deleted,
            })(<Checkbox style={{ display: 'none' }} />)}
            {genActionButton()}
          </FormItem>
        </div>
      </div>
    </div>
  )
}

EditableDiskItem.propTypes = {
  disk: PropTypes.object,
  form: PropTypes.object,
  isNew: PropTypes.bool,
  onRemove: PropTypes.func,
  onRestore: PropTypes.func,
  validatePath: PropTypes.func,
}

export default EditableDiskItem
