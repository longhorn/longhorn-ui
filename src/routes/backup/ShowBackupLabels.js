import React from 'react'
import PropTypes from 'prop-types'
import { formatDate } from '../../utils/formatDate'
import { Form, Descriptions } from 'antd'
import { ModalBlur } from '../../components'
import { withTranslation } from 'react-i18next'

const modal = ({
  item,
  visible,
  onCancel,
  onOk,
  t,
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

  const backupLabelsEle = backupLabels.length > 0 ? <Descriptions title={t('showBackupLabels.descriptions.backupLabels.title')} bordered column={1}>{backupLabels.map((key, index) => {
    return <Descriptions.Item key={index} label={key}>{item[key]}</Descriptions.Item>
  })}</Descriptions> : ''

  const workloadsStatus = kubernetesStatus.workloadsStatus ? kubernetesStatus.workloadsStatus.map((data, index) => {
    return (
      <Descriptions.Item key={index} label={t('showBackupLabels.descriptions.kubernetesStatus.workloadsStatus')} span={2}>
        {t('showBackupLabels.descriptions.kubernetesStatus.podName')}: {data.podName}
        <br />
        {t('showBackupLabels.descriptions.kubernetesStatus.workloadName')}: {data.workloadName}
        <br />
        {t('showBackupLabels.descriptions.kubernetesStatus.workloadType')}: {data.workloadType}
        <br />
        {t('showBackupLabels.descriptions.kubernetesStatus.podStatus')}: {data.podStatus}
      </Descriptions.Item>
    )
  }) : ''

  return (
  <ModalBlur {...modalOpts}>
    <div style={{ width: '100%', overflow: 'auto', maxHeight: '680px' }}>
      {backupLabelsEle}
      { item && item.KubernetesStatus ? <div style={{ marginTop: '20px' }}>
        <Descriptions title={t('showBackupLabels.descriptions.kubernetesStatus.title')} bordered column={2}>
          <Descriptions.Item label={t('showBackupLabels.descriptions.kubernetesStatus.createdTime')} span={2}>{formatDate(snapshotCreated)}</Descriptions.Item>
          <Descriptions.Item label={t('showBackupLabels.descriptions.kubernetesStatus.namespace')} span={2}>{kubernetesStatus.namespace}</Descriptions.Item>
          <Descriptions.Item label={t('showBackupLabels.descriptions.kubernetesStatus.pvName')} span={2}>{kubernetesStatus.pvName}</Descriptions.Item>
          <Descriptions.Item label={t('showBackupLabels.descriptions.kubernetesStatus.pvcName')} span={2}>{kubernetesStatus.pvcName}</Descriptions.Item>
          <Descriptions.Item label={t('showBackupLabels.descriptions.kubernetesStatus.pvStatus')} span={2}>{kubernetesStatus.pvStatus}</Descriptions.Item>
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
  t: PropTypes.func.isRequired,
}

export default withTranslation()(Form.create()(modal))
