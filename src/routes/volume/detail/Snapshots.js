import React from 'react'
import PropTypes from 'prop-types'
import { Button, Tooltip, Card, Switch, Progress } from 'antd'
import { Snapshot } from '../../../components'
import CreateBackupModal from './CreateBackupModal'
import styles from './index.less'
import { disabledSnapshotAction } from '../helper/index'

class Snapshots extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      createBackModalKey: Math.random(),
      createBackBySnapsotModalKey: Math.random(),
      createBackModalVisible: false,
      createBackBySnapsotModalVisible: false,
      currentSnapshotName: '',
      snapshotBackupUrl: '',
      snapshotListUrl: '',
    }
    this.onAction = (action) => {
      if (action.type === 'cloneVolumeFromSnapshot') {
        const { volume, snapshot } = action.payload
        this.props.dispatch({
          type: 'volume/showCloneVolumeModalBefore',
          payload: {
            selectedSnapshot: snapshot,
            selected: volume,
            cloneVolumeType: 'snapshot',
          },
        })
        return
      }
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
        this.refs.Snapshot.showReomve()
        return
      }
      if (action.type === 'snapshotBackup') {
        this.setState({
          ...this.state,
          createBackBySnapsotModalVisible: true,
          currentSnapshotName: action.payload && action.payload.snapshot && action.payload.snapshot.name ? action.payload.snapshot.name : '',
          snapshotBackupUrl: action.payload && action.payload.volume && action.payload.volume.actions && action.payload.volume.actions.snapshotBackup ? action.payload.volume.actions.snapshotBackup : '',
          snapshotListUrl: action.payload && action.payload.volume && action.payload.volume.actions && action.payload.volume.actions.snapshotList ? action.payload.volume.actions.snapshotList : '',
        })
        return
      }

      let additionalActions = []
      let actionType = action.type
      let url = this.props.volume.actions[action.type]
      let params = {
        name: action.payload && action.payload.snapshot ? action.payload.snapshot.name : undefined,
      }

      if (action.type === 'snapshotDelete') {
        additionalActions = [{
          url: this.props.volume.actions.snapshotPurge,
        }]
        // Only snapshotPurge operations are performed when the snapshot status is marked as removed.
        if (action.payload?.snapshot?.removed) {
          additionalActions = []
          actionType = 'snapshotPurge'
          url = this.props.volume.actions?.snapshotPurge
          params = {}
        }
      }
      this.props.dispatch({
        type: 'snapshotModal/snapshotAction',
        payload: {
          type: actionType,
          actions: additionalActions,
          url,
          params,
          querySnapShotUrl: this.props.volume.actions.snapshotList,
        },
      })
    }
  }

  UNSAFE_componentWillMount() {
    this.props.dispatch({
      type: 'snapshotModal/queryVolume',
      payload: { volume: this.props.volume },
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
            ...data,
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

  createBackupBySnapshotModal = () => {
    let me = this
    return {
      item: {
        frontend: 'iscsi',
      },
      visible: me.state.createBackBySnapsotModalVisible,
      onOk(data) {
        if (me.state.snapshotBackupUrl && me.state.currentSnapshotName && me.state.snapshotListUrl) {
          me.props.dispatch({
            type: 'snapshotModal/createBackupBySnapshot',
            payload: {
              snapshotBackupUrl: me.state.snapshotBackupUrl,
              snapshotName: me.state.currentSnapshotName,
              querySnapShotUrl: me.state.snapshotListUrl,
              ...data,
            },
          })
          me.setState({
            ...me.state,
            createBackBySnapsotModalKey: Math.random(),
            createBackBySnapsotModalVisible: false,
            currentSnapshotName: '',
            snapshotBackupUrl: '',
          })
        }
      },
      onCancel() {
        me.setState({
          ...me.state,
          createBackBySnapsotModalKey: Math.random(),
          createBackBySnapsotModalVisible: false,
          currentSnapshotName: '',
          snapshotBackupUrl: '',
        })
      },
    }
  }

  render() {
    if (!this.props.volume) {
      return null
    }

    const isRestoring = () => {
      if (this.props.volume.restoreStatus && this.props.volume.restoreStatus.length > 0) {
        let flag = this.props.volume.restoreStatus.every((item) => {
          return !item.isRestoring
        })
        return !flag
      } else {
        return false
      }
    }
    const upgradingEngine = () => this.props.volume.currentImage !== this.props.volume.image

    const disableBackup = !this.props.volume.actions || !this.props.volume.actions.snapshotCreate || !this.props.state || this.props.volume.standby || isRestoring() || upgradingEngine() || !this.props.backupTargetAvailable

    const createBackupTooltipMessage = () => {
      if (!this.props.backupTargetAvailable) {
        return this.props.backupTargetMessage
      }
      if (this.props.volume.standby) {
        return 'Unable to create backup for DR volume.'
      }
      return 'Create a new backup.'
    }

    const treeProps = {
      loading: this.props.loading,
      volume: this.props.volume,
      state: this.props.state,
      snapshotTree: this.props.showRemoved ? this.props.snapshotTreeWithRemoved : this.props.snapshotTree,
      volumeHead: this.props.volumeHead,
      disableBackup,
      disableBackupMessage: createBackupTooltipMessage(),
    }

    let purgeStatus = {}
    if (treeProps.volume.purgeStatus && treeProps.volume.purgeStatus.length > 0) {
      let total = 0
      let statusErrorMsg = ''
      let isPurging = false
      treeProps.volume.purgeStatus.forEach((ele) => {
        if (ele.error) {
          statusErrorMsg = ele.error
        }
        if (ele.isPurging) {
          isPurging = true
        }
        total += ele.progress
      })
      purgeStatus.statusErrorMsg = statusErrorMsg
      purgeStatus.isPurging = isPurging
      purgeStatus.progress = Math.floor(total / treeProps.volume.purgeStatus.length)
    }

    let purgeStatusEle = () => {
      if (purgeStatus.isPurging) {
        return (
          <div style={{ position: 'absolute', top: 0, left: 0, background: 'rgba(255,255,255,.8)', width: '100%', height: '100%', zIndex: 20, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Tooltip placement="top" title={purgeStatus.statusErrorMsg}>
              <Progress type="circle" format={percent => `Deleting ${percent}%`} strokeWidth={5} percent={purgeStatus.progress}></Progress>
            </Tooltip>
          </div>
        )
      } else {
        return ''
      }
    }

    return (
      <Card title={<div className={styles.header}>
        <div>Snapshots and Backups</div>
        <div>
          <Tooltip placement="top" title={this.props.volume.standby ? 'Unable to create snapshot for DR volume' : "Create a new snapshot. You can create a backup by clicking any snapshot below and selecting 'Backup'."}>
              <Button disabled={disabledSnapshotAction(this.props.volume, this.props.state) || this.props.volume.standby || isRestoring() || upgradingEngine()}
                icon="scan"
                onClick={() => { this.onAction({ type: 'snapshotCreate' }) }}
                type="primary">
                Take Snapshot
              </Button>
            </Tooltip>
            &nbsp;
            <Tooltip placement="top" title={createBackupTooltipMessage()}>
              <Button disabled={disableBackup} icon="copy" onClick={() => { this.onAction({ type: 'backup' }) }} type="primary">
                Create Backup
              </Button>
            </Tooltip>
        </div>
        </div>}
        bordered={false}>
        <div style={{ position: 'relative', top: '0', padding: '20px', backgroundColor: 'white', minHeight: '314px', overflow: 'auto' }}>
          {purgeStatusEle()}
          <div style={{ marginTop: '20px' }}>
            <Snapshot {...treeProps} onAction={this.onAction} ref="Snapshot" />
          </div>
        </div>
        <div style={{ position: 'absolute', top: 80, right: 30 }}>
          Show System Hidden: &nbsp; <Switch onChange={() => { this.onAction({ type: 'toggleShowRemoved' }) }} checked={this.props.showRemoved} />
        </div>
        {this.state.createBackModalVisible ? <CreateBackupModal key={this.state.createBackModalKey} {...this.createBackupModal()} /> : ''}
        {this.state.createBackBySnapsotModalVisible ? <CreateBackupModal key={this.state.createBackBySnapsotModalKey} {...this.createBackupBySnapshotModal()} /> : ''}
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
  backupTargetAvailable: PropTypes.bool,
  backupTargetMessage: PropTypes.string,
  volumeHead: PropTypes.object,
}

export default Snapshots
