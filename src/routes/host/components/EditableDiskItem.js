import React, { PropTypes } from 'react'
import styles from './EditableDiskItem.less'
import { Input, Radio, Checkbox, Form, Tooltip } from 'antd'
import StorageInput from './StorageInput'
import IconRemove from './IconRemove'
import IconRestore from './IconRestore'
import { formatMib } from '../../../utils/formater'
import classnames from 'classnames'

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
            })(<Input
              type="text"
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
              initialValue: parseFloat(formatMib(disk.storageAvailable)),
            })(<span>
              <StorageInput min={0} defaultValue={parseFloat(formatMib(disk.storageAvailable), 10)} readOnly />
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
              initialValue: parseFloat(formatMib(disk.storageMaximum)),
            })(<span>
              <StorageInput min={0} defaultValue={parseFloat(formatMib(disk.storageMaximum), 10)} readOnly />
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
              initialValue: parseFloat(formatMib(disk.storageReserved)),
            })(<span>
              <StorageInput min={0} defaultValue={parseFloat(formatMib(disk.storageReserved), 10)} readOnly={disk.deleted} />
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
              initialValue: parseFloat(formatMib(disk.storageScheduled)),
            })(<span>
              <StorageInput min={0} defaultValue={parseFloat(formatMib(disk.storageScheduled), 10)} readOnly />
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
