import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import { formatDate } from '../../../utils/formatDate'
import { Radio, Checkbox, Form, Tooltip, Input, Select, Icon } from 'antd'
import styles from './EditableDiskItem.less'
import StorageInput from './StorageInput'
import DistTag from './TagComponent.js'
import IconRemove from '../../../components/Icon/IconRemove'
import IconRestore from '../../../components/Icon/IconRestore'
import PathInput from './PathInput'
import { byteToGi } from '../helper/index'

const FormItem = Form.Item
const RadioGroup = Radio.Group
const Option = Select.Option

function EditableDiskItem({ isNew, disk, form, onRestore, onRemove, validatePath, validateName = f => f }) {
  const { getFieldDecorator, getFieldsValue } = form
  const canBeRemoved = () => {
    return disk.storageScheduled === 0 && getFieldsValue().disks[disk.id].allowScheduling === false
  }
  const genActionButton = () => {
    if (disk.deleted) {
      return (<a onClick={() => onRestore(disk.id)}><IconRestore /></a>)
    } else if (canBeRemoved()) {
      return (<a onClick={() => onRemove(disk.id)}><IconRemove /></a>)
    }
    return <Tooltip placement="top" title="Only the disk with disabled scheduling and no storage scheduled can be deleted"><span><IconRemove disabled /></span></Tooltip>
  }

  // Because the parameters passed need to be retained, the content of the form is retained
  return (
    <div style={{ position: 'relative' }} className={classnames(styles.ediableDisk, { [styles.rowDeleted]: disk.deleted })}>
      <div style={{ width: '99%', padding: '0px 15px', lineHeight: '40px' }}>
        {getFieldDecorator(`disks['${disk.id}']['tags']`, {
          initialValue: disk.tags,
        })(<DistTag tags={disk.tags} changeTags={(tags) => { form.setFieldsValue({ [`disks['${disk.id}']['tags']`]: tags }) }} />)}
      </div>
      {disk.conditions ? <div style={{ display: 'flex' }}>
        <div className={styles.formItem} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div className={styles.label}>
            Conditions
          </div>
          <div className={styles.control} style={{ lineHeight: '40px' }}>
            {disk && disk.conditions && Object.keys(disk.conditions).map((key) => {
              let title = (<div>
                {disk.conditions[key] && disk.conditions[key].lastProbeTime && disk.conditions[key].lastProbeTime ? <div style={{ marginBottom: 5 }}>Last Probe Time: {formatDate(disk.conditions[key].lastProbeTime)}</div> : ''}
                {disk.conditions[key] && disk.conditions[key].lastTransitionTime && disk.conditions[key].lastTransitionTime ? <div style={{ marginBottom: 5 }}>Last Transition Time: {formatDate(disk.conditions[key].lastTransitionTime)}</div> : ''}
                {disk.conditions[key] && disk.conditions[key].message && disk.conditions[key].message ? <div style={{ marginBottom: 5 }}>Message: {disk.conditions[key].message}</div> : ''}
                {disk.conditions[key] && disk.conditions[key].reason && disk.conditions[key].reason ? <div style={{ marginBottom: 5 }}>Reason: {disk.conditions[key].reason}</div> : ''}
                {disk.conditions[key] && disk.conditions[key].status && disk.conditions[key].status ? <div style={{ marginBottom: 5 }}>Status: {disk.conditions[key].status}</div> : ''}
              </div>)
              return (<Tooltip key={key} title={title}><div style={{ marginRight: 40 }}>
                  {disk.conditions[key].status && disk.conditions[key].status.toLowerCase() === 'true' ? <Icon className="healthy" style={{ marginRight: 5 }} type="check-circle" /> : <Icon className="faulted" style={{ marginRight: 5 }} type="exclamation-circle" /> }
                  {disk.conditions[key].type}
                </div></Tooltip>)
            })}
            </div>
        </div>
      </div> : ''}
      <div style={{ width: '99%', display: 'flex', justifyContent: 'space-between' }}>
        <div className={styles.formItem} style={{ width: '30%' }}>
          <div className={styles.label}>
            Storage Available
          </div>
          <div className={styles.control} style={{ padding: '5px 15px' }}>
            {byteToGi(disk.storageAvailable)}Gi
          </div>
          <div className={styles.control} style={{ display: 'none' }}>
            <FormItem style={{ margin: 0 }}>
              {getFieldDecorator(`disks['${disk.id}']['storageAvailable']`, {
                initialValue: byteToGi(disk.storageAvailable),
              })(<span>
                <StorageInput min={0} defaultValue={byteToGi(disk.storageAvailable)} readOnly />
              </span>)}
            </FormItem>
          </div>
        </div>
        <div className={styles.formItem} style={{ width: '30%' }}>
          <div className={styles.label}>
            Storage Scheduled
          </div>
          <div className={styles.control} style={{ padding: '5px 15px' }}>
           {byteToGi(disk.storageScheduled)}Gi
          </div>
          <div className={styles.control} style={{ display: 'none' }}>
            <FormItem style={{ margin: 0 }}>
              {getFieldDecorator(`disks['${disk.id}']['storageScheduled']`, {
                initialValue: byteToGi(disk.storageScheduled),
              })(<span>
                <StorageInput min={0} defaultValue={byteToGi(disk.storageScheduled)} readOnly />
              </span>)}
            </FormItem>
          </div>
        </div>
        <div className={styles.formItem} style={{ width: '30%' }}>
          <div className={styles.label}>
            Storage Max
          </div>
          <div className={styles.control} style={{ padding: '5px 15px' }}>
          {byteToGi(disk.storageMaximum)}Gi
          </div>
          <div className={styles.control} style={{ display: 'none' }}>
            <FormItem style={{ margin: 0 }}>
              {getFieldDecorator(`disks['${disk.id}']['storageMaximum']`, {
                initialValue: byteToGi(disk.storageMaximum),
              })(<span>
                <StorageInput min={0} defaultValue={byteToGi(disk.storageMaximum)} readOnly />
              </span>)}
            </FormItem>
          </div>
        </div>
      </div>
      <div className={styles.formItem} style={{ width: '99%' }}>
        <div className={styles.control}>
          <div className={styles.label}>
            Name
          </div>
          <FormItem style={{ margin: 0 }}>
            {getFieldDecorator(`disks['${disk.id}']['name']`, {
              initialValue: disk.name,
              rules: [{
                required: true,
                message: 'Please Input Path!',
              }, {
                validator: validateName,
              }],
            })(<Input
              readOnly={disk.deleted || !isNew} />)}
          </FormItem>
        </div>
        <div className={styles.control}>
          <div className={styles.label}>
            Disk Type
          </div>
          <FormItem style={{ margin: 0 }}>
            {getFieldDecorator(`disks['${disk.id}']['diskType']`, {
              initialValue: disk.diskType,
            })(<Select disabled={disk.deleted || !isNew}>
              <Option value="filesystem">File System</Option>
              <Option value="block">Block</Option>
            </Select>)}
          </FormItem>
        </div>
        <div className={styles.control}>
          <div className={styles.label}>
            Path
          </div>
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
              placeholder="Path mounted by the disk, e.g. /mnt/disk1"
              diskTypeIsFilesystem={getFieldsValue().disks[disk.id].diskType === 'filesystem'}
              readOnly={disk.deleted || !isNew} />)}
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
      {/* <div className={styles.formItem}>
        <div className={styles.label}>
          Disk Tags
        </div>
        <div className={styles.control} style={{ width: '100px' }}>
          <FormItem style={{ margin: '3px 0px 0px 0px' }}>
          {getFieldDecorator(`disks['${disk.id}']['tag']`, {
            initialValue: disk.tags ? disk.tags.join(',') : '',
          })(<Input type="text" size="large" />)}
          </FormItem>
        </div>
      </div> */}
      <div className={styles.formItem}>
        <div className={styles.label}>
          Scheduling
        </div>
        <div className={styles.control} style={{ width: '210px' }}>
          <FormItem style={{ margin: '3px 0px 0px 0px' }}>
            {getFieldDecorator(`disks['${disk.id}']['allowScheduling']`, {
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
            {getFieldDecorator(`disks['${disk.id}']['evictionRequested']`, {
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
      <div className={styles.formItem} style={{ width: '66px' }}>
        <div className={styles.label}>
        &nbsp;
        </div>
        <div className={styles.control}>
          <FormItem style={{ margin: 0 }}>
            {getFieldDecorator(`disks['${disk.id}']['deleted']`, {
              initialValue: !!disk.deleted,
            })(<Checkbox checked style={{ display: 'none' }} />)}
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
  validateName: PropTypes.func,
}

export default EditableDiskItem
