import React, { PropTypes } from 'react'
import { Card, Modal } from 'antd'
import { DropOption } from '../../components'
const confirm = Modal.confirm

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

  render() {
    const { item } = this.props
    return (
      <div style={{ display: 'inline-block', padding: 20 }} key={item.name}>
        <Card bodyStyle={{ height: 240, padding: 0 }} >
          <div style={{ backgroundColor: item.running ? '#108eb9' : 'lightgrey', padding: 20 }}>
            <img
              alt="replica"
              style={{ display: 'inline' }}
              width="70px"
              src={item.running ? '/disk-healthy.png' : '/disk-unhealthy.png'}
              />
            <span style={{ marginLeft: 20, verticalAlign: '100%', fontSize: 15, color: 'white' }}>
              {this.getReplicaShortName(item.name)}
            </span>
          </div>
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <h3>{item.host}</h3>
            <p style={{ color: 'gray' }}>Host</p>
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
}

export default Replica
