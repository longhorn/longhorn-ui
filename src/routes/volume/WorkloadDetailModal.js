import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Input, Icon } from 'antd'
import { formatDate } from '../../utils/formatDate'
import { ModalBlur } from '../../components'

const modal = ({
  visible,
  onCancel,
  onOk,
  item,
}) => {
  const [podFilter, setPodFilter] = useState('')
  const modalOpts = {
    title: item.snapshotCreated ? 'Workload/Pod Status When Backup Created' : 'Workload/Pod',
    visible,
    onCancel,
    onOk,
    hasOnCancel: true,
  }

  const podList = item.podList ? item.podList : []
  const keyword = podFilter.trim().toLowerCase()
  const filteredPodList = keyword ? podList.filter((ele) => {
    return (ele.podName || '').toLowerCase().includes(keyword) || (ele.workloadName || '').toLowerCase().includes(keyword)
  }) : podList

  const CardItem = filteredPodList.map((ele) => {
    return (
      <div style={{ width: '100%', border: '1px solid #f4f4f4', padding: 24, marginRight: 5, marginBottom: 10 }} key={`${ele.workloadName || ''}:${ele.podName || ''}`}>
        {item.snapshotCreated ? <div style={{ marginBottom: '10px' }}> <b>Created Time</b> : {formatDate(item.snapshotCreated)}</div> : ''}
        <div> {item.lastPodRefAt ? <div><b>Last time used by Pod</b> : {formatDate(item.lastPodRefAt)}</div> : ''}</div>
        <div style={{ marginTop: item.lastPodRefAt ? '10px' : '0px' }}> <b>{item.lastPodRefAt ? 'Last ' : ''}Workload Name</b> : {ele.workloadName}</div>
        <div style={{ marginTop: '10px' }}> <b>{item.lastPodRefAt ? 'Last ' : ''}Workload Type</b> : {ele.workloadType}</div>
        <div style={{ marginTop: '10px' }}> <b>{item.lastPodRefAt ? 'Last ' : ''}Pod Name</b> : {ele.podName}</div>
        {!item.lastPodRefAt ? <div style={{ marginTop: '10px' }}> <b>{item.lastPodRefAt ? 'Last ' : ''}Pod Status</b> : {ele.podStatus}</div> : ''}
      </div>
    )
  })

  return (
    <ModalBlur {...modalOpts}>
      {podList.length > 5 ? (
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
          <Input
            allowClear
            prefix={<Icon type="search" style={{ color: 'rgba(0,0,0,.25)' }} />}
            placeholder="Filter by pod or workload name"
            value={podFilter}
            onChange={(e) => setPodFilter(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.nativeEvent.stopImmediatePropagation() } }}
            style={{ width: 300 }}
          />
          <span style={{ marginLeft: 10, color: '#666' }}>{filteredPodList.length} / {podList.length} pods</span>
        </div>
      ) : ''}
      <div style={{ width: '100%', maxHeight: '60vh', overflow: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          {CardItem}
        </div>
        {keyword && !filteredPodList.length ? <div style={{ color: '#666', textAlign: 'center', padding: 24 }}>No pods match the filter</div> : ''}
      </div>
    </ModalBlur>
  )
}

modal.propTypes = {
  visible: PropTypes.bool,
  item: PropTypes.object,
  onOk: PropTypes.func,
  onCancel: PropTypes.func,
}

export default modal
