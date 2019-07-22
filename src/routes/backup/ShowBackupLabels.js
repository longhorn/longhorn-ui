import React from 'react'
import PropTypes from 'prop-types'
import { Form, Descriptions } from 'antd'
import { ModalBlur } from '../../components'

const modal = ({
  item,
  visible,
  onCancel,
  onOk,
}) => {
  function handleOk() {
    onOk()
  }

  const modalOpts = {
    visible,
    onCancel,
    onOk: handleOk,
    hasOnCancel: true,
    width: 800,
  }

  const kubernetesStatus = item.KubernetesStatus ? JSON.parse(item.KubernetesStatus) : {}

  let backupLabels = []

  for (let key in item) {
    if (key !== 'KubernetesStatus') {
      backupLabels.push(key)
    }
  }

  const backupLabelsEle = backupLabels.length > 0 ? <Descriptions title="Backup Labels" bordered column={1}>{backupLabels.map((key, index) => {
    return <Descriptions.Item key={index} label={key}>{item[key]}</Descriptions.Item>
  })}</Descriptions> : ''

  const workloadsStatus = kubernetesStatus.workloadsStatus ? kubernetesStatus.workloadsStatus.map((data, index) => {
    return (
      <div key={index} style={{ marginTop: '20px' }}>
        <Descriptions title="Workloads Status" bordered column={3}>
          <Descriptions.Item label="Pod Name" span={3}>{data.podName}</Descriptions.Item>
          <Descriptions.Item label="Workload Name" span={3}>{data.workloadName}</Descriptions.Item>
          <Descriptions.Item label="Workload Type">{data.workloadType}</Descriptions.Item>
          <Descriptions.Item label="Pod Status">{data.podStatus}</Descriptions.Item>
        </Descriptions>
      </div>
    )
  }) : ''

  return (
  <ModalBlur {...modalOpts}>
    <div style={{ width: '100%', overflow: 'auto', maxHeight: '680px' }}>
      {backupLabelsEle}
      <div style={{ marginTop: '20px' }}>
        <Descriptions title="Kubernetes Status" bordered column={2}>
          <Descriptions.Item label="Namespace" span={2}>{kubernetesStatus.namespace}</Descriptions.Item>
          <Descriptions.Item label="PV Name" span={2}>{kubernetesStatus.pvName}</Descriptions.Item>
          <Descriptions.Item label="PVC Name" span={2}>{kubernetesStatus.pvcName}</Descriptions.Item>
          <Descriptions.Item label="PV Status" span={2}>{kubernetesStatus.pvStatus}</Descriptions.Item>
        </Descriptions>
      </div>
      {workloadsStatus}
    </div>
  </ModalBlur>
  )
}

modal.propTypes = {
  form: PropTypes.object.isRequired,
  visible: PropTypes.bool,
  onCancel: PropTypes.func,
  item: PropTypes.object,
  onOk: PropTypes.func,
  hosts: PropTypes.array,
}

export default Form.create()(modal)
