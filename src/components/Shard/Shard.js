import React from 'react'
import PropTypes from 'prop-types'
import { Card, Tooltip, Progress, Icon, Tag } from 'antd'
import { formatMib } from '../../utils/formatter'
import { formatDate } from '../../utils/formatDate'
import diskHealthyImage from '../../assets/images/disk-healthy.png'
import diskUnhealthyImage from '../../assets/images/disk-unhealthy.png'

const STATE_INFO = {
  normal: { color: '#108eb9', text: 'Healthy' },
  replacing: { color: '#f1c40f', text: 'Rebuilding...' },
  failed: { color: '#f15354', text: 'Failed' },
}

const ROLE_INFO = {
  data: { color: 'blue', text: 'Data' },
  parity: { color: 'purple', text: 'Parity' },
}

function Shard({ item, hosts }) {
  const host = hosts.find(h => h.id === item.nodeID)
  const stateInfo = STATE_INFO[item.state] || { color: 'lightgrey', text: '' }
  const roleInfo = ROLE_INFO[item.role]
  const showRebuildProgress = item.state === 'replacing' && item.rebuildProgress > 0 && item.rebuildProgress < 100
  const stateText = item.state === 'failed' && item.lastFailureTimestamp
    ? <Tooltip title={`Failed ${formatDate(item.lastFailureTimestamp, false)}`}>{stateInfo.text}</Tooltip>
    : stateInfo.text

  return (
    <div style={{ display: 'inline-block', padding: '0px 10px' }}>
      <Card bodyStyle={{ height: 280, padding: 0 }}>
        <div style={{ position: 'relative', backgroundColor: stateInfo.color, padding: 20, color: 'white' }}>
          <img
            alt="shard"
            style={{ display: 'inline' }}
            width="70px"
            src={item.state === 'normal' ? diskHealthyImage : diskUnhealthyImage}
          />
          <span style={{ marginLeft: 20, verticalAlign: '100%', fontSize: 15 }}>
            <Tooltip title={item.name}>Shard {item.slotIndex}</Tooltip>
            {host && (host.region || host.zone) ? <Tooltip title={<span> region: {host.region} <br></br> zone: {host.zone} </span>}><Icon style={{ marginLeft: '5px' }} type="environment" /></Tooltip> : ''}
          </span>
          {showRebuildProgress && <div style={{ width: '50%', position: 'absolute', top: '57px', left: '44%', height: '44px', justifyContent: 'center', display: 'flex', flexDirection: 'column' }}>
            <Tooltip title={`Rebuilding ${item.rebuildProgress}%`}>
              <Progress status="success" percent={item.rebuildProgress} showInfo={false} />
            </Tooltip>
          </div>}
          <p style={{ position: 'absolute', left: 112, bottom: 20, verticalAlign: '100%' }}>
            {stateText}
          </p>
        </div>
        <div style={{ textAlign: 'center', marginTop: '32px', marginBottom: '10px', padding: '0px 10px' }}>
          <h3>{(host && host.name) || item.nodeID || 'N/A'}</h3>
          <div style={{ color: 'gray' }}>Node</div>
        </div>
        <div style={{ textAlign: 'center', padding: '0px 10px' }}>
          <Tooltip title={item.diskUUID || 'N/A'}>
            <h3>{item.diskPath || 'N/A'}</h3>
          </Tooltip>
        </div>
        {roleInfo && <span style={{ position: 'absolute', bottom: 20, left: 20 }}>
          <Tag color={roleInfo.color}>{roleInfo.text}</Tag>
        </span>}
        <span style={{ position: 'absolute', bottom: 20, right: 20, color: 'gray' }}>
          {formatMib(item.size)}
        </span>
      </Card>
    </div>
  )
}

Shard.propTypes = {
  item: PropTypes.object.isRequired,
  hosts: PropTypes.array,
}

export default Shard
