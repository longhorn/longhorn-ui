import React from 'react'
import PropTypes from 'prop-types'
import { Table, Card, Alert, Tooltip, Icon } from 'antd'
import styles from './index.less'
import { withTranslation } from 'react-i18next'

function VolumeAttachment({ t, volumeAttachment = {}, loading = false }) {
  const isError = volumeAttachment?.code && volumeAttachment.code !== 0
  const errorMessage = isError ? (volumeAttachment.message || t('volumeAttachment.error.defaultMessage')) : null
  const attachments = volumeAttachment?.attachments ? Object.values(volumeAttachment.attachments) : []
  const dataSource = attachments.map(attachment => ({
    key: attachment.attachmentID,
    attachmentID: attachment.attachmentID,
    attachmentType: attachment.attachmentType,
    nodeID: attachment.nodeID,
    satisfied: attachment.satisfied,
    conditions: attachment.conditions || [],
    lastTransitionTime: attachment.conditions?.[0]?.lastTransitionTime || ''
  }))

  const columns = [
    { title: t('columns.attachmentID'), dataIndex: 'attachmentID', key: 'attachmentID' },
    { title: t('columns.attachmentType'), dataIndex: 'attachmentType', key: 'attachmentType' },
    { title: t('columns.nodeID'), dataIndex: 'nodeID', key: 'nodeID' },
    {
      title: t('columns.satisfied'),
      dataIndex: 'satisfied',
      key: 'satisfied',
      render: (text, record) => {
        const isSatisfied = !!text
        const message = record.conditions?.[0]?.message

        if (isSatisfied) return t('common.yes')
        return (
          <Tooltip title={message || t('volumeAttachment.satisfied.notSatisfied')}>
            <span>
              {t('common.no')} {message && <Icon type="info-circle" />}
            </span>
          </Tooltip>
        )
      }
    },
    { title: t('columns.lastTransitionTime'), dataIndex: 'lastTransitionTime', key: 'lastTransitionTime' },
  ]

  return (
   <Card title={
    <div className={styles.header}>
      <div>{t('volumeAttachment.title')}</div>
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
  t: PropTypes.func,
  volumeAttachment: PropTypes.object,
  loading: PropTypes.bool
}

export default withTranslation()(VolumeAttachment)
