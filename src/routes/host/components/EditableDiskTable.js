import React, { PropTypes } from 'react'
import { Button, Form, Table, Tooltip, Checkbox } from 'antd'
import EditableDiskCell from './EditableDiskCell'
import styles from './EditableDiskTable.less'
const FormItem = Form.Item

let uuid = 0

class EditableTable extends React.Component {
  constructor(props) {
    super(props)
    const disks = Object.keys(props.node.disks).map(item => ({ ...props.node.disks[item], id: item }))
    this.originDisk = props.node.disks
    this.state = { data: disks }

    this.columns = [
      {
        title: 'path',
        dataIndex: 'path',
        key: 'path',
        width: '27%',
        render: (text, record) => {
          return this.renderColumns(text, 'path', record.id, record.deleted || !!this.originDisk[record.id])
        },
      },
      {
        title: 'Storage Available',
        dataIndex: 'storageAvailable',
        key: 'storageAvailable',
        width: '13%',
        render: (text, record) => {
          return this.renderColumns(text, 'storageAvailable', record.id, record.deleted)
        },
      },
      {
        title: 'Storage Maximum',
        dataIndex: 'storageMaximum',
        key: 'storageMaximum',
        width: '13%',
        render: (text, record) => {
          return this.renderColumns(text, 'storageMaximum', record.id, record.deleted)
        },
      },
      {
        title: 'Storage Reserved',
        dataIndex: 'storageReserved',
        key: 'storageReserved',
        width: '13%',
        render: (text, record) => {
          return this.renderColumns(text, 'storageReserved', record.id, record.deleted)
        },
      },
      {
        title: 'Storage Scheduled',
        dataIndex: 'storageScheduled',
        key: 'storageScheduled',
        width: '13%',
        render: (text, record) => {
          return this.renderColumns(text, 'storageScheduled', record.id, record.deleted)
        },
      },
      {
        title: 'Allow Scheduling',
        dataIndex: 'allowScheduling',
        key: 'allowScheduling',
        width: '13%',
        render: (text, record) => {
          return this.renderColumns(text, 'allowScheduling', record.id, record.deleted)
        },
      },
      {
        title: '',
        key: 'operation',
        width: '8%',
        render: (text, record) => {
          const { getFieldDecorator, getFieldsValue } = this.props.form
          const canBeRemoved = () => {
            return record.storageScheduled === 0 && getFieldsValue().disks[record.id].allowScheduling === false
          }
          const genActionButton = () => {
            if (record.deleted) {
              return <Button icon="rollback" shape="circle" onClick={() => this.onRestore(record.id)} />
            } else if (canBeRemoved()) {
              return <Button icon="delete" shape="circle" onClick={() => this.onRemove(record.id)} />
            }
            return <Tooltip placement="top" title="Only the disk with disabled scheduling and no storage scheduled can be deleted"><Button disabled icon="delete" shape="circle" /> </Tooltip>
          }
          return (
            <div style={{ position: 'relative' }}>
              <div className={record.deleted ? styles.lineThrough : ''}></div>
                <FormItem style={{ margin: 0 }}>
                  {getFieldDecorator(`disks['${record.id}']['deleted']`, {
                    initialValue: !!record.deleted,
                  })(<Checkbox style={{ display: 'none' }} />)}
                  {genActionButton()}
                </FormItem>
            </div>
          )
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
    const disk = { id: `new_disk_${uuid}`, path: '', storageAvailable: 0, storageMaximum: 0, storageReserved: 0, storageScheduled: 0, allowScheduling: false }
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

  renderColumns(text, column, rowIndex, disabled) {
    return (
      <EditableDiskCell form={this.props.form} value={text} dataIndex={column} rowIndex={rowIndex} disabled={disabled} />
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
