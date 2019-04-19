import React, { PropTypes } from 'react'
import { ModalBlur } from '../../components'
import { Card } from 'antd'
import moment from 'moment'

const modal = ({
  visible,
  onCancel,
  onOk,
  item,
}) => {
  const modalOpts = {
    title: 'Workload/Pod',
    visible,
    onCancel,
    onOk,
    hasOnCancel: true,
  }

  let CardItem = []
  if (item.podList) {
    CardItem = item.podList.map((ele, index) => {
      return (
        <Card key={index} style={{ width: 260, margin: '5px' }}>
          <div> {item.lastPodRefAt ? <div><b>Last time used by Pod</b> : {moment(new Date(item.lastPodRefAt)).fromNow()}</div> : ''}</div>
          <div> <b>{item.lastPodRefAt ? 'Last ' : ''}Workload Name</b> : {ele.workloadName}</div>
          <div style={{ marginTop: '10px' }}> <b>Workload Type</b> : {ele.workloadType}</div>
          <div style={{ marginTop: '10px' }}> <b>{item.lastPodRefAt ? 'Last ' : ''}Pod Name</b> : {ele.podName}</div>
          {!item.lastPodRefAt ? <div style={{ marginTop: '10px' }}> <b>Pod Status</b> : {ele.podStatus}</div> : ''}
        </Card>
      )
    })
  }

  return (
    <ModalBlur {...modalOpts}>
      <div style={{ width: '100%', overflow: 'auto' }}>
        <div style={{ display: 'flex', width: 'fit-content' }}>
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
