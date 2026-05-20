import React from 'react'
import PropTypes from 'prop-types'
import { formatDate } from '../../utils/formatDate'
import { ModalBlur } from '../../components'
import { withTranslation } from 'react-i18next'

const modal = ({
  visible,
  onCancel,
  onOk,
  item,
  t,
}) => {
  const modalOpts = {
    title: item.snapshotCreated ? t('workloadDetailModal.title.backupCreated') : t('workloadDetailModal.title.workloadPod'),
    visible,
    onCancel,
    onOk,
    hasOnCancel: true,
  }

  let CardItem = []
  if (item.podList) {
    CardItem = item.podList.map((ele, index) => {
      return (
        <div style={{ width: '100%', border: '1px solid #f4f4f4', padding: 24, marginRight: 5, marginBottom: 10 }} key={index}>
          {item.snapshotCreated ? <div style={{ marginBottom: '10px' }}> <b>{t('workloadDetailModal.fields.createdTime')}</b> : {formatDate(item.snapshotCreated)}</div> : ''}
          <div> {item.lastPodRefAt ? <div><b>{t('workloadDetailModal.fields.lastTimeUsedByPod')}</b> : {formatDate(item.lastPodRefAt)}</div> : ''}</div>
          <div style={{ marginTop: item.lastPodRefAt ? '10px' : '0px' }}> <b>{item.lastPodRefAt ? `${t('workloadDetailModal.prefixes.last')} ` : ''}{t('workloadDetailModal.fields.workloadName')}</b> : {ele.workloadName}</div>
          <div style={{ marginTop: '10px' }}> <b>{item.lastPodRefAt ? `${t('workloadDetailModal.prefixes.last')} ` : ''}{t('workloadDetailModal.fields.workloadType')}</b> : {ele.workloadType}</div>
          <div style={{ marginTop: '10px' }}> <b>{item.lastPodRefAt ? `${t('workloadDetailModal.prefixes.last')} ` : ''}{t('workloadDetailModal.fields.podName')}</b> : {ele.podName}</div>
          {!item.lastPodRefAt ? <div style={{ marginTop: '10px' }}> <b>{item.lastPodRefAt ? `${t('workloadDetailModal.prefixes.last')} ` : ''}{t('workloadDetailModal.fields.podStatus')}</b> : {ele.podStatus}</div> : ''}
        </div>
      )
    })
  }

  return (
    <ModalBlur {...modalOpts}>
      <div style={{ width: '100%', overflow: 'auto' }}>
        <div style={{ display: 'flex', whiteSpace: 'nowrap', width: '100%' }}>
          {CardItem}
        </div>
      </div>
    </ModalBlur>
  )
}

modal.propTypes = {
  visible: PropTypes.bool,
  item: PropTypes.object,
  onOk: PropTypes.func,
  onCancel: PropTypes.func,
  t: PropTypes.func,
}

export default withTranslation()(modal)
