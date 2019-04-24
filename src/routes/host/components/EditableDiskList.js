import React from 'react'
import PropTypes from 'prop-types'
import { Form, Button } from 'antd'
import EditableDiskItem from './EditableDiskItem'
import { formatPath } from '../helper/index'

let uuid = 0

class EditableDiskList extends React.Component {
  constructor(props) {
    super(props)
    const disks = Object.keys(props.node.disks).map(item => ({ ...props.node.disks[item], id: item }))
    this.originDisks = props.node.disks
    this.state = { data: disks }
  }
  onAdd = () => {
    uuid++
    const disk = { id: `new_disk_${uuid}`, path: '', storageAvailable: 0, storageMaximum: 0, storageReserved: 0, storageScheduled: 0, allowScheduling: false }
    const newData = [...this.state.data]
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

  render() {
    const data = this.state.data
    const originDisks = this.originDisks
    const { form } = this.props
    return (
      <Form>
        {data.map(d => (<EditableDiskItem key={d.id} disk={d} form={form} isNew={!originDisks[d.id]} onRemove={this.onRemove} onRestore={this.onRestore} validatePath={this.validatePath} />))}
        <div style={{ textAlign: 'right', margin: '20px 20px' }}>
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
