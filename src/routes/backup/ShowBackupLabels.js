import React from 'react'
import PropTypes from 'prop-types'
import { formatDate } from '../../utils/formatDate'
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

  const kubernetesStatus = item && item.KubernetesStatus ? JSON.parse(item.KubernetesStatus) : {}
  const snapshotCreated = item && item.snapshotCreated ? item.snapshotCreated : ''

  let backupLabels = []

  for (let key in item) {
    if (key !== 'KubernetesStatus' && key !== 'snapshotCreated') {
      backupLabels.push(key)
    }
  }

  const backupLabelsEle = backupLabels.length > 0 ? <Descriptions title="Backup Labels" bordered column={1}>{backupLabels.map((key, index) => {
    return <Descriptions.Item key={index} label={key}>{item[key]}</Descriptions.Item>
  })}</Descriptions> : ''

  const workloadsStatus = kubernetesStatus.workloadsStatus ? kubernetesStatus.workloadsStatus.map((data, index) => {
    return (
      <Descriptions.Item key={index} label="Workloads Status" span={2}>
        Pod Name: {data.podName}
        <br />
        Workload Name: {data.workloadName}
        <br />
        Workload Type: {data.workloadType}
        <br />
        Pod Status: {data.podStatus}
      </Descriptions.Item>
    )
  }) : ''

  return (
  <ModalBlur {...modalOpts}>
    <div style={{ width: '100%', overflow: 'auto', maxHeight: '680px' }}>
      {backupLabelsEle}
      { item && item.KubernetesStatus ? <div style={{ marginTop: '20px' }}>
        <Descriptions title="Kubernetes Status When Backup Created" bordered column={2}>
          <Descriptions.Item label="Created Time" span={2}>{formatDate(snapshotCreated)}</Descriptions.Item>
          <Descriptions.Item label="Namespace" span={2}>{kubernetesStatus.namespace}</Descriptions.Item>
          <Descriptions.Item label="PV Name" span={2}>{kubernetesStatus.pvName}</Descriptions.Item>
          <Descriptions.Item label="PVC Name" span={2}>{kubernetesStatus.pvcName}</Descriptions.Item>
          <Descriptions.Item label="PV Status" span={2}>{kubernetesStatus.pvStatus}</Descriptions.Item>
          {workloadsStatus}
        </Descriptions>
      </div> : '' }
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
