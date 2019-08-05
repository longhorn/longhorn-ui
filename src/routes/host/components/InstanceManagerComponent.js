import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Table } from 'antd'

class InstanceManagerComponent extends React.Component {
  render() {
    const { instanceManagerData } = this.props.host
    const { data } = this.props.engineimage

    data.forEach((item) => {
      let flag = false
      instanceManagerData.forEach((ele) => {
        if (item.name === ele.engineImage) {
          flag = true
          item.replicaCurrentState = ele.replicaCurrentState
          item.currentState = ele.currentState
        }
      })
      if (!flag) {
        item.replicaCurrentState = 'Unknown'
        item.currentState = 'Unknown'
      }
    })
    const columns = [
      {
        title: 'Engine',
        key: 'version',
        width: 120,
        render: (record) => {
          return (
            <div>{record.version}</div>
          )
        },
      },
      {
        title: 'Engine Image',
        key: 'state',
        width: 200,
        render: (record) => {
          return (
            <div>{record.state}</div>
          )
        },
      },
      {
        title: 'Instance Manager - Engine',
        key: 'currentState',
        width: 200,
        render: (record) => {
          return (
            <div>{record.currentState}</div>
          )
        },
      },
      {
        title: 'Instance Manager - Replica',
        key: 'replicaCurrentState',
        width: 200,
        render: (record) => {
          return (
            <div>{record.replicaCurrentState}</div>
          )
        },
      },
    ]
    return (
      <div>
        <Table
          bordered={false}
          columns={columns}
          dataSource={data}
          pagination={false}
          rowKey={record => record.id}
          height={'100%'}
          scroll={{ y: 400 }}
        />
      </div>
    )
  }
}

InstanceManagerComponent.propTypes = {
  host: PropTypes.object,
  engineimage: PropTypes.object,
}

export default connect(({ host, engineimage }) => ({ host, engineimage }))(InstanceManagerComponent)
