import React, { PropTypes } from 'react'
import { Button, Form, Table } from 'antd'
import EditableDiskCell from './EditableDiskCell'
import styles from './EditableDiskTable.less'
const FormItem = Form.Item

let uuid = 0

class EditableTable extends React.Component {
  constructor(props) {
    super(props)
    const disks = Object.keys(props.node.disks).map(item => ({ ...props.node.disks[item], id: item }))
    this.state = { data: disks }

    this.columns = [
      {
        title: 'path',
        dataIndex: 'path',
        key: 'path',
        width: '27%',
        render: (text, record) => {
          return this.renderColumns(text, 'path', record.id, record)
        },
      },
      {
        title: 'Storage Available',
        dataIndex: 'storageAvailable',
        key: 'storageAvailable',
        width: '13%',
        render: (text, record) => {
          return this.renderColumns(text, 'storageAvailable', record.id, record)
        },
      },
      {
        title: 'Storage Maximum',
        dataIndex: 'storageMaximum',
        key: 'storageMaximum',
        width: '13%',
        render: (text, record) => {
          return this.renderColumns(text, 'storageMaximum', record.id, record)
        },
      },
      {
        title: 'Storage Reserved',
        dataIndex: 'storageReserved',
        key: 'storageReserved',
        width: '13%',
        render: (text, record) => {
          return this.renderColumns(text, 'storageReserved', record.id, record)
        },
      },
      {
        title: 'Storage Scheduled',
        dataIndex: 'storageScheduled',
        key: 'storageScheduled',
        width: '13%',
        render: (text, record) => {
          return this.renderColumns(text, 'storageScheduled', record.id, record)
        },
      },
      {
        title: 'Allow Scheduling',
        dataIndex: 'allowScheduling',
        key: 'allowScheduling',
        width: '13%',
        render: (text, record) => {
          return this.renderColumns(text, 'allowScheduling', record.id, record)
        },
      },
      {
        title: '',
        key: 'opration',
        width: '8%',
        render: (text, record) => {
          const { getFieldDecorator, getFieldsValue } = this.props.form
          if ((!this.props.node.storageScheduled && !record.allowScheduling) || !getFieldsValue().disks[record.id].allowScheduling) {
            if (getFieldsValue().disks[record.id].allowScheduling) {
              return null
            }
            return (
              <div style={{ position: 'relative' }}>
                <div className={record.deleted ? styles.lineThrough : ''}></div>
                  <FormItem style={{ margin: 0 }}>
                    {getFieldDecorator(`disks[${record.id}]['deleted']`, {
                      initialValue: !!record.deleted,
                    })(record.deleted ? <Button icon="rollback" shape="circle" onClick={() => this.onRestore(record.id)} /> : <Button icon="delete" shape="circle" onClick={() => this.onRemove(record.id)} />)}
                  </FormItem>
              </div>
            )
          }
          return null
        },
      },
    ]

    this.rowClassName = (record) => {
      if (record.deleted) {
        return styles.rowDeleted
      }
      return ''
    }
  }

  onAdd() {
    uuid++
    const disk = { id: `new_disk_${uuid}`, path: '', storageAvailable: '', storageMaximum: '', storageReserved: '', storageScheduled: '', allowScheduling: false }
    const newData = [...this.state.data]
    newData.push(disk)
    this.setState({ data: newData })
  }

  onRemove(id) {
    if (this.props.node.disks[id]) {
      this.preRemove(id)
    } else {
      this.remove(id)
    }
  }

  onRestore(id) {
    const newData = [...this.state.data]
    const disk = newData.find(item => item.id === id)
    if (disk) {
      disk.deleted = false
      this.setState({ data: newData })
    }
  }

  preRemove(id) {
    const newData = [...this.state.data]
    const disk = newData.find(item => item.id === id)
    if (disk) {
      disk.deleted = true
      this.setState({ data: newData })
    }
  }

  remove(id) {
    this.setState({ data: this.state.data.filter(item => item.id !== id) })
  }

  renderColumns(text, column, rowIndex, record) {
    return (
      <EditableDiskCell form={this.props.form} value={text} dataIndex={column} rowIndex={rowIndex} disabled={record.deleted} />
    )
  }

  render() {
    return (
      <Form>
        <div style={{ textAlign: 'right', marginBottom: '10px' }}>
          <Button type="primary" onClick={() => this.onAdd()}> Add Disk </Button>
        </div>
        <Table
          bordered
          dataSource={this.state.data}
          columns={this.columns}
          rowClassName={this.rowClassName}
          simple
          pagination={false}
          rowKey={record => record.id}
        />

      </Form>
    )
  }
}

EditableTable.propTypes = {
  form: PropTypes.object,
  node: PropTypes.object,
}

export default EditableTable
