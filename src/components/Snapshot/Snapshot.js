import React from 'react'
import PropTypes from 'prop-types'
import { Tree, Icon, Menu, Dropdown, Button, Tooltip, Progress, Spin, Modal } from 'antd'
import { formatSnapshot, formatMib } from '../../utils/formatter'
import { formatDate } from '../../utils/formatDate'
import { disabledSnapshotAction } from '../../routes/volume/helper/index'
import { withTranslation } from 'react-i18next'
import './Snapshot.less'

const TreeNode = Tree.TreeNode

function StartPoint() {
  return (
    <div className="tree-snapshot-start-point">
    </div>
  )
}

// display volume head
function VolumeHead(props) {
  const { t } = props
  return (
    props ? (<Tooltip placement="right"
      autoAdjustOverflow={false}
      title={<div>
      <p className="snapshot-name">{t('common.name')}: {props.name}</p>
      <p className="snapshot-created">{t('snapshot.tooltip.created')}: {props.created}</p>
      <p className="snapshot-name">{t('columns.size')}: {formatMib(props.size)}</p>
      <p className="snapshot-name">{t('snapshot.tooltip.createdByUser')}: {props.usercreated ? t('common.true') : t('common.false')}</p>
    </div>}>
    <div className="snapshot-current-desc">
      <Button>
        <Icon type="caret-right" />{t('snapshot.volumeHead')}
        </Button>
    </div>
    </Tooltip>) : (
      <div className="snapshot-current-desc">
        <Button>
          <Icon type="caret-right" />{t('snapshot.volumeHead')}
        </Button>
      </div>)
  )
}
VolumeHead.propTypes = {
  removed: PropTypes.bool,
  name: PropTypes.string,
  created: PropTypes.string,
  size: PropTypes.string,
  usercreated: PropTypes.string,
  t: PropTypes.func.isRequired,
}

// render each snapshot action dropdown
function SnapshotIcon(props, snapshotProps) {
  const { t } = snapshotProps
  function doAction(key) {
    snapshotProps.onAction({
      type: key,
      payload: {
        volume: snapshotProps.volume,
        snapshot: props,
      },
    })
  }

  function onClick({ key }) {
    if (key === 'snapshotRevert' && snapshotProps && snapshotProps.volume) {
      const title = (
        <div>
          <h3 style={{ margin: 0, padding: 0, marginTop: -2 }}> {!snapshotProps.volume.disableFrontend ? t('snapshot.modal.cannotRevertTitle') : t('snapshot.modal.confirmSnapshotRevertTitle') }</h3>
          {!snapshotProps.volume.disableFrontend ? (<div style={{ marginTop: '15px' }}>
              <p>{t('snapshot.modal.reattachInMaintenanceMode')}</p>
              <p>{t('snapshot.modal.workloadShutdownNeeded')}</p>
            </div>) : ''
          }
        </div>
      )

      if (snapshotProps && snapshotProps.volume && snapshotProps.volume.disableFrontend) {
        Modal.confirm({
          title,
          okText: t('common.ok'),
          cancelText: t('common.cancel'),
          onOk: () => {
            doAction('snapshotRevert')
          },
        })
      }
      return
    }
    if (key === 'snapshotBackup' && snapshotProps.disableBackup) {
      return
    }
    doAction(key)
  }

  let snapshotObject = formatSnapshot(snapshotProps.volume, props)
  const menu = (
    <Menu
      className="lh-snapshot-dropdown"
      onClick={onClick}
    >
      { props.usercreated && !snapshotObject.removed ? <Menu.Item className="revert-menu-item" key="snapshotRevert">
          {snapshotProps.volume.disableFrontend ? <div style={{ padding: '0px 12px' }}>{t('snapshot.dropdown.revert')}</div> : <Tooltip title={<div>
            <p>{t('snapshot.modal.reattachInMaintenanceMode')}</p>
            <p>{t('snapshot.modal.workloadShutdownNeeded')}</p>
          </div>}><div className="disable-dropdown-menu">{t('snapshot.dropdown.revert')}</div></Tooltip> }
        </Menu.Item> : ''
      }
      { props.usercreated && !snapshotObject.removed ? (
        <Menu.Item key="snapshotBackup" className="revert-menu-item">
          { !snapshotProps.disableBackup ? (
            <div style={{ padding: '0px 12px' }}>{t('snapshot.dropdown.backUp')}</div>
          ) : (
            <Tooltip title={snapshotProps.disableBackupMessage}>
              <div className="disable-dropdown-menu">{t('snapshot.dropdown.backUp')}</div>
            </Tooltip>
          )}
        </Menu.Item>
      ) : ''
      }
      <Menu.Item key="cloneVolumeFromSnapshot">
        <div style={{ padding: '0px 12px' }}>{t('snapshot.dropdown.cloneVolume')}</div>
      </Menu.Item>
      <Menu.Item key="snapshotDelete">
        <div style={{ padding: '0px 12px' }}>{t('snapshot.dropdown.delete')}</div>
      </Menu.Item>
    </Menu>
  )
  let backupStatusObject = snapshotObject.backupStatusObject
  let backupStatusHasError = backupStatusObject && backupStatusObject.backupError && backupStatusObject.backupError.length > 0
  let backupStatusErrorMsg = backupStatusHasError ? <div>{ backupStatusObject.backupError.map((ele, index) => {
    return <p key={index} className="snapshot-name">{ele.replica ? ele.replica : t('common.error')}: {ele.error}</p>
  }) }</div> : ''

  /**
   * Default color: #3085d5 only snapshot
   * Backup color: #33AB65
   * Create by system color: #F1C40
   * Removed color: #cccccc
   * Error color: #F15354
   * Priority Error > Removed > Create by system > Backup color > Default color
   */
  let backgroundColor = '#3085d5'

  if (snapshotObject.usercreated && backupStatusObject) {
    backgroundColor = '#33AB65'
  } else if (!snapshotObject.usercreated) {
    backgroundColor = '#F1C40F'
  }

  if (snapshotObject.removed) {
    backgroundColor = '#cccccc'
  }

  if (backupStatusHasError) {
    backgroundColor = '#F15354'
  }

  return (
    <Dropdown
      placement="bottomLeft"
      overlay={menu}
      trigger={['click']}
      key={snapshotObject.name}
      getPopupContainer={() => {
        return document.getElementById('tree-snapshot') || document.body
      }}
    >
      <Tooltip placement="right"
        autoAdjustOverflow={false}
        title={<div>
        <p className="snapshot-name">{t('common.name')}: {snapshotObject.name}</p>
        <p className="snapshot-created">{t('snapshot.tooltip.created')}: {snapshotObject.created}</p>
        <p className="snapshot-name">{t('columns.size')}: {backupStatusObject && backupStatusObject.progress === 100 ? formatMib(backupStatusObject.size) : formatMib(snapshotObject.size)}</p>
        <p className="snapshot-name">{t('snapshot.tooltip.createdByUser')}: {snapshotObject.usercreated ? t('common.true') : t('common.false')}</p>
        <p className="snapshot-name">{t('snapshot.tooltip.removed')}: {snapshotObject.removed ? t('common.true') : t('common.false')}</p>
        {
          backupStatusObject ? <div>
            <p className="snapshot-created">{t('snapshot.tooltip.progress')}: {backupStatusObject.progress}%</p>
           {backupStatusObject.replicas && <p className="snapshot-created" style={{ wordBreak: 'break-all' }}>{t('snapshot.tooltip.replicas')}: {backupStatusObject.replicas}</p>}
           {backupStatusObject.replicas && <p className="snapshot-created" style={{ wordBreak: 'break-all' }}>{t('snapshot.tooltip.backups')}: {backupStatusObject.backupIds}</p>}
            {/* <p className="snapshot-created">{t('snapshot.tooltip.backupURL')}: {backupStatusObject.backupURL}</p> */}
            {backupStatusErrorMsg}</div> : ''
        }
      </div>}>
        <div>
          <div className="tree-snapshot-icon" style={{ background: backgroundColor }}>
            <Icon className="snapshot-icon" type="camera" />
            { backupStatusObject && backupStatusObject.progress > 0 && backupStatusObject.progress < 100 && !backupStatusHasError ? <div style={{ position: 'absolute', background: 'rgba(255,255,255,1)', top: '-5px', left: '-5px' }}>
                <Progress type="circle" percent={backupStatusObject.progress} width={40} />
              </div> : ''
            }
          </div>
          <div className="tree-snapshot-desc">
            <p className="snapshot-name">{snapshotObject.name.substr(0, 8)}</p>
            <p className="snapshot-time">{formatDate(snapshotObject.created)}</p>
          </div>
        </div>
      </Tooltip>
    </Dropdown>
  )
}
SnapshotIcon.propTypes = {
  removed: PropTypes.bool,
  name: PropTypes.string,
  created: PropTypes.string,
  size: PropTypes.string,
  usercreated: PropTypes.string,
}

// render volume head point with take snapshot action
function CurrentPoint(props) {
  const { t } = props
  function onClick() {
    props.onAction({
      type: 'snapshotCRCreate',
      payload: {
        volume: props.volume,
      },
    })
  }
  const menu = (
    <Menu onClick={onClick}>
      <Menu.Item key="1" disabled={disabledSnapshotAction(props.volume, props.state)}>
        <span>{t('snapshot.dropdown.takeSnapshot')}</span>
      </Menu.Item>
    </Menu>
  )
  return (
    <Dropdown
      overlay={menu}
      trigger={['click']}
      key={props.volume.id}
    >
      {VolumeHead({ ...props.volumeHead, t })}
    </Dropdown>
  )
}
CurrentPoint.propTypes = {
  onAction: PropTypes.func,
  volume: PropTypes.object,
  state: PropTypes.bool,
  volumeHead: PropTypes.object,
  t: PropTypes.func.isRequired,
}

const loop = (data, props) => data.map((item) => {
  let title
  if (item.name) {
    title = SnapshotIcon(item, props)
  } else {
    title = CurrentPoint(props)
    return <TreeNode key={item} title={title} />
  }
  if (item.childrenNode && item.childrenNode.length) {
    return <TreeNode key={item.name} title={title}>{loop(item.childrenNode, props)}</TreeNode>
  }
  return <TreeNode isLeaf key={item.name} title={title} />
})

class Snapshot extends React.Component {
  state = {
    key: Math.random(),
    loadingState: true,
    loading: false,
    previousCreated: '',
  }

  showReomve = () => {
    this.state.key = Math.random()
  }

  render() {
    const { t } = this.props
    let props = this.props
    let children = null
    if (props.snapshotTree) {
      children = props.snapshotTree.length > 0 ? loop(props.snapshotTree, { ...props, t }) : <TreeNode key="1" title={CurrentPoint({ ...props, t })} />
      if (props.loading || this.state.loadingState !== props.loading) {
        this.state.loadingState = props.loading
        this.state.loading = true
        setTimeout(() => {
          this.state.loading = false
          this.state.key = Math.random()
        }, 0)
      }
    } else if (!props.volume.actions.snapshotList) {
      this.state.loading = false
    }

    if (props.volumeHead) {
      if (props.volumeHead.created && props.volumeHead.created !== this.state.previousCreated) {
        this.state.loading = true
        setTimeout(() => {
          this.state.loading = false
          this.state.key = Math.random()
        }, 0)
        this.state.previousCreated = props.volumeHead.created
        // this.setState({
        //   ...this.state,
        //   previousCreated: props.volumeHead.created,
        // })
      }
    }

    return (
      <Spin spinning={this.state.loading}>
        <div id="tree-snapshot">
          <Tree
            defaultExpandAll
            className="lh-tree-snapshot"
            autoExpandParent={false}
            key={this.state.key}
          >
            <TreeNode className="tree-start-wrap" title={StartPoint()} key={`${props.volume.id}`}>
              {children}
            </TreeNode>
          </Tree>
        </div>
      </Spin>
    )
  }
}
Snapshot.propTypes = {
  snapshotTree: PropTypes.array,
  loading: PropTypes.bool,
  volume: PropTypes.object,
  state: PropTypes.bool,
  volumeHead: PropTypes.object,
  disableBackup: PropTypes.bool,
  t: PropTypes.func.isRequired,
}

export default withTranslation()(Snapshot)
