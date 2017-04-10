import React, { PropTypes } from 'react'
import { Table, Button, Select } from 'antd'
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
    this.state.dataSource.push({ name: `recurring${new Date().getTime()}`, editing: true, cron: '1 1 * * *', task: 'snapshot' })
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
      }, {
        title: '',
        key: 'operation',
        width: 100,
        render: (text, record) => {
          return (
            <div style={{ textAlign: 'right' }}>
              {!record.editing && <Button type="primary" icon="edit" shape="circle" onClick={() => this.onEdit(record)} />}
              <Button style={{ marginLeft: '20px' }} type="primary" icon="delete" shape="circle" onClick={() => this.onDelete(record)} />
            </div>
          )
        },
      },
    ]
    const pagination = false
    const { dataSource } = this.state

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
        <Button style={{ marginTop: '20px' }} onClick={this.onNewRecurring} type="primary" icon="plus">New</Button>
      </div>
    )
  }
}

RecurringList.propTypes = {
  dataSource: PropTypes.array,
}

export default RecurringList
