import React from 'react'
import PropTypes from 'prop-types'
import { ModalBlur } from '../../components'
import { Card } from 'antd'
import IconBackup from '../../components/Icon/IconBackup'
import prettyCron from '../../utils/prettycron'

const modal = ({
  visible,
  onCancel,
  onOk,
  item,
}) => {
  const modalOpts = {
    title: 'Recurring Snapshot and Backup',
    visible,
    onCancel,
    onOk,
    hasOnCancel: true,
    width: 680,
  }

  let CardItem = []
  if (item) {
    item.sort((a, b) => {
      return a.task.localeCompare(b.task)
    })
    CardItem = item.map((ele, index) => {
      let fill = ele.task === 'backup' ? '#00C1DE' : 'rgb(241, 196, 15)'
      return (
        <Card key={index} style={{ width: 380, margin: '5px' }}>
          <div style={{ minHeight: '30px', display: 'flex', alignItems: 'center', marginBottom: '5px' }}><b style={{ marginRight: '10px' }}>Type: </b> <span style={{ marginRight: '4px' }}>{ele.task}</span> <IconBackup fill={fill} /></div>
          <div style={{ minHeight: '30px', display: 'flex' }}><b style={{ marginRight: '10px' }}>Schedule: </b>{prettyCron.toString(ele.cron)}</div>
          <div style={{ minHeight: '30px', display: 'flex' }}><b style={{ marginRight: '10px' }}>Retain: </b>{ele.retain}</div>
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
  item: PropTypes.array,
  onOk: PropTypes.func,
  onCancel: PropTypes.func,
}

export default modal
