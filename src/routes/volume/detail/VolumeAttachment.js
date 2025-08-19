import React from 'react'
import PropTypes from 'prop-types'
import { Table, Card, Alert } from 'antd'
import styles from './index.less'

function VolumeAttachment({ volumeAttachment = {}, loading = false }) {
  const isError = volumeAttachment?.code && volumeAttachment.code !== 0
  const errorMessage = isError ? (volumeAttachment.message || 'Failed to fetch volume attachments') : null
  const attachments = volumeAttachment?.attachments ? Object.values(volumeAttachment.attachments) : []
  const dataSource = attachments.map(attachment => ({
    key: attachment.attachmentID,
    attachmentID: attachment.attachmentID,
    attachmentType: attachment.attachmentType,
    nodeID: attachment.nodeID,
    satisfied: attachment.satisfied,
    lastTransitionTime: attachment.conditions?.[0]?.lastTransitionTime || ''
  }))

  const columns = [
    { title: 'Attachment ID', dataIndex: 'attachmentID', key: 'attachmentID' },
    { title: 'Attachment Type', dataIndex: 'attachmentType', key: 'attachmentType' },
    { title: 'Node ID', dataIndex: 'nodeID', key: 'nodeID' },
    { title: 'Satisfied', dataIndex: 'satisfied', key: 'satisfied', render: text => (text ? 'yes' : 'no') },
    { title: 'Last Transition Time', dataIndex: 'lastTransitionTime', key: 'lastTransitionTime' },
  ]

  return (
   <Card title={
    <div className={styles.header}>
      <div>Volume Attachments</div>
    </div>
   }>
    {
      isError
        ? <Alert message={errorMessage} type="error" showIcon />
        : <Table
            loading={loading}
            dataSource={dataSource}
            columns={columns}
            pagination={false}
            scroll={{ y: 400 }}
          />
    }
   </Card>
  )
}

VolumeAttachment.propTypes = {
  volumeAttachment: PropTypes.object,
  loading: PropTypes.bool
}

export default VolumeAttachment
