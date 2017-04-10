import React, { PropTypes } from 'react'
import { Table, Button, Select } from 'antd'
import { Schedule } from '../../components'

const Option = Select.Option

class RecurringList extends React.Component {

  state = {
    dataSource: this.props.dataSource,
  }

  onNewRecurring = () => {
    this.state.dataSource.push({ id: new Date().getTime(), creating: true })
    const dataSource = this.state.dataSource
    this.setState({
      dataSource,
    })
  }

  render() {
    const columns = [
      {
        title: 'Type',
        dataIndex: 'task',
        key: 'task',
        width: 100,
        render: (text, record) => {
          return (
            record.creating ?
              <div>
                <Select defaultValue="backup" style={{ width: 80 }}>
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
            <Schedule cron={record.cron} />
          )
        },
      }, {
        title: '',
        key: 'operation',
        width: 100,
        render: () => {
          return (
            <div>
              <Button style={{ marginRight: '20px' }} type="primary" icon="delete" shape="circle" />
              <Button type="primary" icon="edit" shape="circle" />
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
