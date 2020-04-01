import React from 'react'
import PropTypes from 'prop-types'
import { Form, Button, Radio } from 'antd'
import styles from './EditableDiskItem.less'
import EditableDiskItem from './EditableDiskItem'
import { formatPath } from '../helper/index'
import DistTag from './TagComponent.js'

const FormItem = Form.Item
const RadioGroup = Radio.Group
let uuid = 0
let nameCount = 0

class EditableDiskList extends React.Component {
  constructor(props) {
    super(props)
    const disks = Object.keys(props.node.disks).map(item => ({ ...props.node.disks[item], name: item, id: item }))
    this.originDisks = props.node.disks
    this.state = { data: disks }
  }

  onAdd = () => {
    let newData = [...this.state.data]
    let nameArray = []
    const reg = /^(0|[1-9][0-9]*)(\.[0-9]*)?$/
    newData.forEach((item) => {
      if (item && item.name && item.name.startsWith('disk-') > -1) {
        let diskNameArr = item.name.split('-')
        if (diskNameArr[1] && !isNaN(diskNameArr[1]) && reg.test(diskNameArr[1])) {
          nameCount = parseInt(diskNameArr[1], 10)
          // Make sure the disk[id] is not duplicated
          nameArray.push(nameCount)
        }
      }
    })

    if (nameArray.length > 0) {
      nameCount = nameArray.reduce((a, b) => {
        return a > b ? a : b
      })
    }
    nameCount++

    uuid++
    const disk = { id: `new_disk_${uuid}`, name: `disk-${nameCount}`, path: '', storageAvailable: 0, storageMaximum: 0, storageReserved: 0, storageScheduled: 0, allowScheduling: false }
    newData.push(disk)
    this.setState({ data: newData })
  }

  onRemove = (id) => {
    if (this.originDisks[id]) {
      this.preRemove(id)
    } else {
      this.remove(id)
    }
  }

  onRestore = (id) => {
    const newData = [...this.state.data]
    const disk = newData.find(item => item.id === id)
    if (disk) {
      disk.deleted = false
      this.setState({ data: newData })
    }
  }

  preRemove = (id) => {
    const newData = [...this.state.data]
    const disk = newData.find(item => item.id === id)
    if (disk) {
      disk.deleted = true
      this.setState({ data: newData })
    }
  }

  remove = (id) => {
    this.setState({ data: this.state.data.filter(item => item.id !== id) }, () => {
      this.props.form.validateFields({ force: true })
    })
  }

  validatePath = (rule, value, callback) => {
    if (value && Object.values(this.props.form.getFieldsValue().disks).filter(d => formatPath(d.path) === formatPath(value)).length > 1) {
      callback('This directory already exists')
    } else {
      callback()
    }
  }

  validateName = (rule, value, callback) => {
    let reg = /^[a-zA-Z0-9][a-zA-Z0-9_.-]+$/
    if (!reg.test(value)) {
      callback('The input is not valid Name')
    }
    if (value && Object.values(this.props.form.getFieldsValue().disks).filter(d => d.name === value).length > 1) {
      callback('This name already exists')
    } else {
      callback()
    }
  }

  render() {
    const data = this.state.data
    const originDisks = this.originDisks
    const { form, node } = this.props
    const { getFieldDecorator } = form

    return (
      <Form>
        <div style={{ display: 'flex' }}>
          <div className={styles.formItem} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '15px 30px' }}>
            <div className={styles.label}>
              Node Scheduling
            </div>
            <div className={styles.control} style={{ width: '210px' }}>
              <FormItem style={{ margin: '3px 0px 0px 0px' }}>
                {getFieldDecorator('nodeAllowScheduling', {
                  initialValue: node.allowScheduling,
                })(
                  <RadioGroup>
                    <Radio value>Enable</Radio>
                    <Radio value={false}>Disable</Radio>
                  </RadioGroup>
                )}
              </FormItem>
            </div>
          </div>
          <div className={styles.formItem} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '15px 30px' }}>
            <div className={styles.label}>
              Node Tags
            </div>
            <div className={styles.control} style={{ width: '500px', lineHeight: '40px' }}>
              <div>
                {getFieldDecorator('tags', {
                  initialValue: node.tags,
                })(<DistTag nodeBoolean={true} tags={node.tags} changeTags={(tags) => { form.setFieldsValue({ tags }) }} />)}
              </div>
            </div>
          </div>
        </div>
        {data.map((d, i) => (<EditableDiskItem key={i} disk={d} form={form} isNew={!originDisks[d.id]} onRemove={this.onRemove} onRestore={this.onRestore} validatePath={this.validatePath} validateName={this.validateName} />))}
        <div style={{ textAlign: 'right' }}>
          <Button style={{ backgroundColor: '#eef0f1' }} onClick={() => this.onAdd()}> Add Disk </Button>
        </div>
      </Form>
    )
  }
}

EditableDiskList.propTypes = {
  form: PropTypes.object,
  node: PropTypes.object,
}

export default EditableDiskList
