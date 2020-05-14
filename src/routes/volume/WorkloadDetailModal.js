import React from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import { ModalBlur } from '../../components'

const modal = ({
  visible,
  onCancel,
  onOk,
  item,
}) => {
  const modalOpts = {
    title: item.snapshotCreated ? 'Workload/Pod Status When Backup Created' : 'Workload/Pod',
    visible,
    onCancel,
    onOk,
    hasOnCancel: true,
  }

  let CardItem = []
  if (item.podList) {
    CardItem = item.podList.map((ele, index) => {
      return (
        <div style={{ border: '1px solid #f4f4f4', padding: 24, marginRight: 5, marginBottom: 10 }} key={index}>
          {item.snapshotCreated ? <div style={{ marginBottom: '10px' }}> <b>Created Time</b> : {moment(new Date(item.snapshotCreated)).fromNow()}</div> : ''}
          <div> {item.lastPodRefAt ? <div><b>Last time used by Pod</b> : {moment(new Date(item.lastPodRefAt)).fromNow()}</div> : ''}</div>
          <div style={{ marginTop: item.lastPodRefAt ? '10px' : '0px' }}> <b>{item.lastPodRefAt ? 'Last ' : ''}Workload Name</b> : {ele.workloadName}</div>
          <div style={{ marginTop: '10px' }}> <b>{item.lastPodRefAt ? 'Last ' : ''}Workload Type</b> : {ele.workloadType}</div>
          <div style={{ marginTop: '10px' }}> <b>{item.lastPodRefAt ? 'Last ' : ''}Pod Name</b> : {ele.podName}</div>
          {!item.lastPodRefAt ? <div style={{ marginTop: '10px' }}> <b>{item.lastPodRefAt ? 'Last ' : ''}Pod Status</b> : {ele.podStatus}</div> : ''}
        </div>
      )
    })
  }

  return (
    <ModalBlur {...modalOpts}>
      <div style={{ width: '100%', overflow: 'auto' }}>
        <div style={{ display: 'flex', width: 1, whiteSpace: 'nowrap' }}>
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
}

export default modal
