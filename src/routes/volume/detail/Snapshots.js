import React, { PropTypes } from 'react'
import { Button, Spin, Tooltip, Card, Switch } from 'antd'

import { Snapshot } from '../../../components'
import { backupProgressModal } from '../../../utils/backup'
import styles from './index.less'

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
      if (action.type === 'toggleShowRemoved') {
        this.props.dispatch({
          type: 'snapshotModal/setShowRemoved',
          payload: !this.props.showRemoved,
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
    this.props.dispatch({
      type: 'snapshotModal/startPolling',
      payload: {
        querySnapShotUrl: this.props.volume.actions.snapshotList,
      },
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
    if (nextProps.showRemoved !== this.props.showRemoved) {
      return true
    }
    if (nextProps.showRemoved === false && nextProps.snapshotTree === this.props.snapshotTree) {
      return false
    }
    if (nextProps.showRemoved === false && nextProps.snapshotTree.length !== this.props.snapshotTree.length) {
      return true
    }
    if (nextProps.showRemoved === true && nextProps.snapshotTreeWithRemoved === this.props.snapshotTreeWithRemoved) {
      return false
    }
    if (nextProps.showRemoved === true && nextProps.snapshotTreeWithRemoved.length !== this.props.snapshotTreeWithRemoved.length) {
      return true
    }
    const result = nextProps.showRemoved ? this.isSameTree(nextProps.snapshotTreeWithRemoved, this.props.snapshotTreeWithRemoved) : this.isSameTree(nextProps.snapshotTree, this.props.snapshotTree)
    return !result
  }
  componentWillUnmount() {
    this.props.dispatch({ type: 'snapshotModal/setSnapshot', payload: [] })
    this.props.dispatch({
      type: 'snapshotModal/stopPolling',
    })
  }
  isSameTree = (p, q) => {
    if (p === q) {
      return true
    }
    if (typeof p !== typeof q) {
      return false
    }
    if (p.length !== q.length) {
      return false
    }
    const len = p.length
    for (let i = 0; i < len; i++) {
      let pNode = p[i]
      let qNode = q[i]
      if (pNode.id !== qNode.id) {
        return false
      }
      const isSame = this.isSameTree(pNode.childrenNode, qNode.childrenNode)
      if (!isSame) {
        return false
      }
    }
    return true
  }
  render() {
    if (!this.props.volume) {
      return null
    }
    const treeProps = {
      loading: this.props.loading,
      volume: this.props.volume,
      state: this.props.state,
      snapshotTree: this.props.showRemoved ? this.props.snapshotTreeWithRemoved : this.props.snapshotTree,
    }
    // Must regenerate tree, or there are some bugs when update tree
    const SnapshotGen = () => {
      return (<Snapshot {...treeProps} onAction={this.onAction} />)
    }
    return (
      <Spin spinning={this.props.loading}>
      <Card title={<div className={styles.header}>
        <div>Snapshots: Show Removed Snapshots <Switch onChange={() => { this.onAction({ type: 'toggleShowRemoved' }) }} checked={this.props.showRemoved} /></div>
        <div>
          <Tooltip placement="top" title="Create a new snapshot. You can create a backup by clicking any snapshot below and selecting 'Backup'.">
              <Button disabled={!this.props.volume.actions || !this.props.volume.actions.snapshotCreate || !this.props.state} icon="scan" onClick={() => { this.onAction({ type: 'snapshotCreate' }) }} type="primary" >
                Take Snapshot
              </Button>
            </Tooltip>
            &nbsp;
            <Tooltip placement="top" title="Create a new snapshot and then create a backup of the snapshot.">
              <Button disabled={!this.props.volume.actions || !this.props.volume.actions.snapshotCreate || !this.props.state} icon="copy" onClick={() => { this.onAction({ type: 'backup' }) }} type="primary" >
                Create Backup
              </Button>
            </Tooltip>
        </div>
        </div>} bordered={false} >
        <div style={{ position: 'relative', top: '0', padding: '20px', backgroundColor: 'white', minHeight: '314px', overflow: 'auto' }}>
          <div style={{ marginTop: '20px' }}>
            <SnapshotGen />
          </div>
        </div>
        </Card>
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
  snapshotTreeWithRemoved: PropTypes.array,
  state: PropTypes.bool,
  showRemoved: PropTypes.bool,
}

export default Snapshots
