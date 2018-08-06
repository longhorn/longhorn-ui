import React, { PropTypes } from 'react'
import { Button, Spin } from 'antd'

import { Snapshot } from '../../components'
import { backupProgressModal } from '../../utils/backup'

class Snapshots extends React.Component {
  constructor(props) {
    super(props)
    this.onAction = (action) => {
      if (action.type === 'backup') {
        backupProgressModal(props.volumeId)
        this.props.dispatch({
          type: 'snapshotModal/backup',
          payload: {
            snapshotCreateUrl: this.props.volume.actions.snapshotCreate,
            snapshotBackupUrl: this.props.volume.actions.snapshotBackup,
            querySnapShotUrl: this.props.volume.actions.snapshotList,
          },
        })
        return
      }
      let actions
      if (action.type === 'snapshotDelete') {
        actions = [{
          url: this.props.volume.actions.snapshotPurge,
        }]
      }
      this.props.dispatch({
        type: 'snapshotModal/snapshotAction',
        payload: {
          type: action.type,
          actions,
          url: this.props.volume.actions[action.type],
          params: {
            name: action.payload && action.payload.snapshot ? action.payload.snapshot.name : undefined,
          },
          querySnapShotUrl: this.props.volume.actions.snapshotList,
        },
      })
    }
  }
  componentWillMount() {
    this.props.dispatch({
      type: 'snapshotModal/queryVolume',
      payload: this.props.volumeId,
    })
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.volume.state !== this.props.volume.state) {
      this.props.dispatch({
        type: 'snapshotModal/queryVolume',
        payload: this.props.volumeId,
      })
    }
  }
  shouldComponentUpdate(nextProps) {
    if (nextProps.loading !== this.props.loading ||
      nextProps.volume.state !== this.props.volume.state) {
      return true
    }
    // avoid unnecessary dom update
    if (nextProps.snapshotTree === this.props.snapshotTree) {
      return false
    }
    return true
  }
  componentWillUnmount() {
    this.props.dispatch({ type: 'snapshotModal/setSnapshot', payload: [] })
  }
  render() {
    if (!this.props.volume) {
      return null
    }
    // Must regenerate tree, or there are some bugs when update tree
    const SnapshotGen = () => {
      return (<Snapshot {...this.props} onAction={this.onAction} />)
    }
    return (
      <Spin spinning={this.props.loading}>
        <div style={{ position: 'relative', top: '0', padding: '20px', backgroundColor: 'white', minHeight: '314px', overflow: 'auto' }}>
          <Button disabled={!this.props.volume.actions || !this.props.volume.actions.snapshotCreate || !this.props.state} icon="scan" onClick={() => { this.onAction({ type: 'snapshotCreate' }) }} type="primary" >
            Take Snapshot
          </Button>
          &nbsp;
          <Button disabled={!this.props.volume.actions || !this.props.volume.actions.snapshotCreate || !this.props.state} icon="scan" onClick={() => { this.onAction({ type: 'backup' }) }} type="primary" >
            Create Backup
          </Button>
          <div style={{ marginTop: '20px' }}>
            <SnapshotGen />
          </div>
        </div>
      </Spin>
    )
  }

}

Snapshots.propTypes = {
  volumeId: PropTypes.string,
  dispatch: PropTypes.func,
  volume: PropTypes.object,
  loading: PropTypes.bool,
  snapshotTree: PropTypes.array,
  state: PropTypes.bool,
}

export default Snapshots
