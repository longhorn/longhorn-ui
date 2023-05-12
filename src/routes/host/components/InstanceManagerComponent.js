import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Table, Tooltip } from 'antd'

class InstanceManagerComponent extends React.Component {
  render() {
    const { instanceManagerData } = this.props.host
    const engineimage = this.props.engineimage.data
    const defaultInstanceManager = this.props.defaultInstanceManager
    const defaultEngineImage = this.props.defaultEngineImage
    const currentNode = this.props.currentNode

    let data = []
    let engineimageObj = { name: 'Engine Image', image: defaultEngineImage.value, state: 'not deployed', id: 'engineRowKey' }

    engineimage.forEach((item) => {
      if (defaultEngineImage.value === item.image && item.nodeDeploymentMap && item.nodeDeploymentMap[currentNode.id]) {
        engineimageObj.state = 'deployed'
      }
    })
    data.push(engineimageObj)

    instanceManagerData.forEach((item) => {
      let instanceManagerObj = { name: 'Instance Manager', image: 'N/A', state: 'N/A', id: 'instanceRowKey' }
      if (defaultInstanceManager.value === item.image && item.nodeID === currentNode.id) {
        instanceManagerObj.image = item.image
        // Engine will deprecated in v1.6.x
        if (item.managerType === 'engine') {
          instanceManagerObj.name = `${instanceManagerObj.name} (Deprecated)`
          let replicaCurrentState = item.replicaCurrentState
          !currentNode.disks ? replicaCurrentState = 'N/A' : ''
          instanceManagerObj.state = `Engine: ${item.currentState}  |  Replica: ${replicaCurrentState}`
        } else if (item.managerType === 'aio') {
          instanceManagerObj.state = item.currentState
        }
      }
      data.push(instanceManagerObj)
    })

    const columns = [
      {
        title: 'Name',
        key: 'name',
        width: 220,
        render: (record) => {
          return (
            <Tooltip title={record.name === 'EngineImage' ? 'Provides the binary to start and communicate with the volume engine/replicas' : 'Manages the engine/replica instances’ life cycle on the node'}>
              <div>{record.name}</div>
            </Tooltip>
          )
        },
      },
      {
        title: 'Image',
        key: 'version',
        width: 220,
        render: (record) => {
          return (
            <div>{record.image}</div>
          )
        },
      },
      {
        title: 'State',
        key: 'state',
        width: 200,
        render: (record) => {
          return (
            <div>{record.state}</div>
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
  defaultInstanceManager: PropTypes.object,
  defaultEngineImage: PropTypes.object,
  currentNode: PropTypes.object,
}

export default connect(({ host, engineimage }) => ({ host, engineimage }))(InstanceManagerComponent)
