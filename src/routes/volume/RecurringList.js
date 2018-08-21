import React, { PropTypes } from 'react'
import { Table, Button, Select, InputNumber } from 'antd'
import { Schedule } from '../../components'

const Option = Select.Option

class RecurringList extends React.Component {

  state = {
    dataSource: this.props.dataSource,
  }

  componentWillMount() {
    const { dataSource } = this.state
    dataSource.forEach((data) => { data.editing = false })
  }

  onNewRecurring = () => {
    this.state.dataSource.push({ retain: 20, name: `c-${Math.random().toString(36).substr(2, 6)}`, editing: true, cron: '0 0 * * *', task: 'snapshot', isNew: true })
    this.setState({
      dataSource: this.state.dataSource,
    })
  }

  onDelete = (record) => {
    const index = this.state.dataSource.findIndex(data => data.name === record.name)
    this.state.dataSource.splice(index, 1)
    const dataSource = this.state.dataSource
    this.setState({
      dataSource,
    })
  }

  onEdit = (record) => {
    record.editing = true
    const dataSource = this.state.dataSource
    this.setState({
      dataSource,
    })
  }
  onCancel = (record) => {
    const originRecord = this.props.dataSource.find(item => item.name === record.name)
    if (originRecord) {
      const dataSource = this.state.dataSource.map(item => (item.name === record.name ? { ...originRecord } : item))
      this.setState({
        dataSource,
      })
    }
  }

  onScheduleChange = (record, newCron) => {
    const found = this.state.dataSource.find(data => data.name === record.name)
    if (found) {
      found.cron = newCron
      const dataSource = this.state.dataSource
      this.setState({
        dataSource,
      })
    }
  }

  onTaskTypeChange = (record, task) => {
    const found = this.state.dataSource.find(data => data.name === record.name)
    if (found) {
      found.task = task
      const dataSource = this.state.dataSource
      this.setState({
        dataSource,
      })
    }
  }

  onRetainChange = (record, retain) => {
    const found = this.state.dataSource.find(data => data.name === record.name)
    if (found) {
      found.retain = retain
      const dataSource = this.state.dataSource
      this.setState({
        dataSource,
      })
    }
  }

  onSave = () => {
    const { dataSource } = this.state
    dataSource.forEach((data) => { data.editing = false })
    this.props.onOk(dataSource)
  }

  isRecurringChanged = (origin, target) => {
    const keys = Object.keys(origin)
    let isChanged = false
    for (let i = 0; i < keys.length; i++) {
      if (origin[keys[i]] !== target[keys[i]]) {
        isChanged = true
        break
      }
    }
    return isChanged
  }

  isFormChanged = () => {
    const { dataSource: formData } = this.state
    const { dataSource: originData } = this.props
    if (formData.length !== originData.length) {
      return true
    }
    const editingFormData = this.state.dataSource.filter(item => item.editing === true)
    if (editingFormData.length === 0) {
      return false
    }
    const newItems = editingFormData.filter(item => item.isNew === true)
    if (newItems.length !== 0) {
      return true
    }
    const editingItems = editingFormData.filter(item => !item.isNew)

    if (editingItems.length === 0) {
      return false
    }

    let isChanged = false
    for (let i = 0, len = editingItems.length; i < len; i++) {
      isChanged = this.isRecurringChanged(originData.find(item => item.name === editingItems[i].name) || {}, editingItems[i])
      if (isChanged) {
        break
      }
    }
    return isChanged
  }

  render() {
    const columns = [
      {
        title: 'Type',
        dataIndex: 'task',
        key: 'task',
        width: 120,
        render: (text, record) => {
          return (
            record.editing ?
              <div>
                <Select onChange={(value) => this.onTaskTypeChange(record, value)} defaultValue={record.task} style={{ width: 100 }}>
                  <Option value="snapshot">Snapshot</Option>
                  <Option value="backup">Backup</Option>
                </Select>
              </div> :
              <div className="capitalize">
                {text}
              </div>
          )
        },
      }, {
        title: 'Schedule',
        dataIndex: 'schedule',
        key: 'schedule',
        render: (text, record) => {
          return (
            <Schedule cron={record.cron} editing={record.editing} onChange={(newCron) => this.onScheduleChange(record, newCron)} />
          )
        },
      },
      {
        title: 'Retain',
        dataIndex: 'retain',
        key: 'retain',
        width: 120,
        render: (text, record) => {
          return (
            record.editing ?
              <div>
                <InputNumber min={1} value={text} onChange={(value) => this.onRetainChange(record, value)} />
              </div> :
              <div>
                {text}
              </div>
          )
        },
      }, {
        title: '',
        key: 'operation',
        width: 100,
        render: (text, record) => {
          return (
            <div style={{ textAlign: 'right' }}>
              {!record.editing && <Button type="primary" icon="edit" shape="circle" onClick={() => this.onEdit(record)} />}
              {record.editing && !record.isNew && <Button type="primary" icon="reload" shape="circle" onClick={() => this.onCancel(record)} />}
              <Button style={{ marginLeft: '20px' }} type="primary" icon="delete" shape="circle" onClick={() => this.onDelete(record)} />
            </div>
          )
        },
      },
    ]
    const pagination = false
    const { dataSource } = this.state
    const { loading } = this.props
    return (
      <div>
        <Table
          bordered={false}
          columns={columns}
          dataSource={dataSource}
          simple
          pagination={pagination}
          rowKey={record => record.name}
        />
        <Button style={{ marginTop: '20px' }} onClick={this.onNewRecurring} icon="plus">New</Button>
        <Button loading={loading} disabled={!this.isFormChanged()} style={{ marginTop: '20px', float: 'right' }} onClick={this.onSave} type="primary">Save</Button>
      </div>
    )
  }
}

RecurringList.propTypes = {
  dataSource: PropTypes.array,
  onOk: PropTypes.func,
  loading: PropTypes.bool,
}

export default RecurringList
