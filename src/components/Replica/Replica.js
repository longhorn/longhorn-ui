import React, { PropTypes } from 'react'
import { Card, Modal } from 'antd'
import { DropOption } from '../../components'
const confirm = Modal.confirm
import diskHealthyImage from '../../assets/images/disk-healthy.png'
import diskUnhealthyImage from '../../assets/images/disk-unhealthy.png'

class Replica extends React.Component {
  state = {}

  getReplicaShortName = (name) => {
    let tokens = name.split('-')
    return tokens.slice(tokens.length - 3, tokens.length).join('-')
  }

  handleMenuClick = (record, event) => {
    const { deleteReplica } = this.props
    switch (event.key) {
      case 'delete':
        confirm({
          title: `Are you sure you want to delete replica ${record.name} ?`,
          onOk() {
            deleteReplica(record.name)
          },
        })
        break
      default:
    }
  }

  get modeInfo() {
    // Replica mode: RW (normal/healthy),
    // WO(rebuilding, probably yellow),
    // ERR (fault, can be treated the same with FailedAt set).
    // It will only reports if engine is running.
    const { item: { running, mode } } = this.props
    const m = mode.toLowerCase()
    const out = {
      color: 'lightgrey',
      text: '',
    }
    if (running) {
      if (m === 'rw') {
        out.color = '#108eb9'
        out.text = 'Healthy'
      } else if (m === 'wo') {
        out.color = '#f1c40f'
        out.text = 'Rebuilding...'
      } else if (m === 'err') {
        out.color = '#f15354'
        out.text = 'Failed'
      }
    }
    return out
  }
  render() {
    const { item, hosts } = this.props
    const host = hosts.find(h => h.id === item.hostId)
    return (
      <div style={{ display: 'inline-block', padding: 20 }} key={item.name}>
        <Card bodyStyle={{ height: 280, padding: 0 }} >
          <div style={{ position: 'relative', backgroundColor: this.modeInfo.color, padding: 20, color: 'white' }}>
            <img
              alt="replica"
              style={{ display: 'inline' }}
              width="70px"
              src={item.running ? diskHealthyImage : diskUnhealthyImage}
              />
            <span style={{ marginLeft: 20, verticalAlign: '100%', fontSize: 15 }}>
              {this.getReplicaShortName(item.name)}
            </span>
            <p style={{ position: 'absolute', left: 112, bottom: 20, verticalAlign: '100%' }}>
              {this.modeInfo.text}
            </p>
          </div>
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <h3>{(host && host.name) || 'N/A'}</h3>
            <p style={{ color: 'gray' }}>Host</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <h3>{(host && host.disks && host.disks[item.diskID] && host.disks[item.diskID].path) || 'N/A'}</h3>
            <p style={{ color: 'gray' }}>Path</p>
          </div>
          <span style={{ position: 'absolute', bottom: 20, left: 20 }} className={item.running ? 'healthy' : 'stopped'}>
            {item.running ? 'Running' : 'Stopped'}
          </span>
          <span style={{ position: 'absolute', bottom: 18, right: 10 }}>
            <DropOption menuOptions={[
              { key: 'delete', name: 'Delete' },
            ]} onMenuClick={e => this.handleMenuClick(item, e)}
            />
          </span>
          {!item.running && <div style={{
            height: '5px',
            width: '100%',
            background: 'rgba(15,15,15,.925)',
            position: 'absolute',
            bottom: 0,
          }} />}
        </Card>
      </div >
    )
  }
}

Replica.propTypes = {
  item: PropTypes.object.isRequired,
  deleteReplica: PropTypes.func,
  hosts: PropTypes.array,
}

export default Replica
