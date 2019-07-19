import React from 'react'
import PropTypes from 'prop-types'
import { Button, Tooltip, Card, Switch } from 'antd'
import { Snapshot } from '../../../components'
import CreateBackupModal from './CreateBackupModal'
import styles from './index.less'
import { disabledSnapshotAction } from '../helper/index'

class Snapshots extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      createBackModalKey: Math.random(),
      createBackModalVisible: false,
    }
    this.onAction = (action) => {
      if (action.type === 'backup') {
        this.setState({
          ...this.state,
          createBackModalVisible: true,
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

  UNSAFE_componentWillMount() {
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

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.volume.state !== this.props.volume.state) {
      this.props.dispatch({
        type: 'snapshotModal/queryVolume',
        payload: this.props.volumeId,
      })
    }
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

  createBackupModal = () => {
    let me = this
    return {
      item: {
        frontend: 'iscsi',
      },
      visible: me.state.createBackModalVisible,
      onOk(data) {
        me.props.dispatch({
          type: 'snapshotModal/backup',
          payload: {
            snapshotCreateUrl: me.props.volume.actions.snapshotCreate,
            snapshotBackupUrl: me.props.volume.actions.snapshotBackup,
            querySnapShotUrl: me.props.volume.actions.snapshotList,
            labels: data,
          },
        })
        me.setState({
          ...me.state,
          createBackModalKey: Math.random(),
          createBackModalVisible: false,
        })
      },
      onCancel() {
        me.setState({
          ...me.state,
          createBackModalKey: Math.random(),
          createBackModalVisible: false,
        })
      },
    }
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
      volumeHead: this.props.volumeHead,
    }

    return (
      <Card title={<div className={styles.header}>
        <div>Snapshots</div>
        <div>
          <Tooltip placement="top" title="Create a new snapshot. You can create a backup by clicking any snapshot below and selecting 'Backup'.">
              <Button disabled={disabledSnapshotAction(this.props.volume, this.props.state) || this.props.volume.standby}
                icon="scan"
                onClick={() => { this.onAction({ type: 'snapshotCreate' }) }}
                type="primary">
                Take Snapshot
              </Button>
            </Tooltip>
            &nbsp;
            <Tooltip placement="top" title="Create a new snapshot and then create a backup of the snapshot.">
              <Button disabled={!this.props.volume.actions || !this.props.volume.actions.snapshotCreate || !this.props.state || this.props.volume.standby} icon="copy" onClick={() => { this.onAction({ type: 'backup' }) }} type="primary">
                Create Backup
              </Button>
            </Tooltip>
        </div>
        </div>}
        bordered={false}>
        <div style={{ float: 'right', fontSize: '14px' }}>
          Show System Hidden: &nbsp; <Switch onChange={() => { this.onAction({ type: 'toggleShowRemoved' }) }} checked={this.props.showRemoved} />
        </div>
        <div style={{ position: 'relative', top: '0', padding: '20px', backgroundColor: 'white', minHeight: '314px', overflow: 'auto' }}>
          <div style={{ marginTop: '20px' }}>
            <Snapshot {...treeProps} onAction={this.onAction} />
          </div>
        </div>
        <CreateBackupModal key={this.state.createBackModalKey} {...this.createBackupModal()} />
      </Card>
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
  volumeHead: PropTypes.object,
}

export default Snapshots
