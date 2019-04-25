import React, { PropTypes } from 'react'
import { Tree, Icon, Menu, Dropdown, Button, Popconfirm, Tooltip } from 'antd'
import { backupProgressModal } from '../../utils/backup'
import { formatMib } from '../../utils/formater'
import moment from 'moment'
import { disabledSnapshotAction } from '../../routes/volume/helper/index'
import './Snapshot.less'

const TreeNode = Tree.TreeNode

function StartPoint() {
  return (
    <div className="tree-snapshot-start-point">
    </div>
  )
}

function VolumeHead(props) {
  return (
    props ?
    (<Tooltip placement="right" autoAdjustOverflow={false} title={<div>
      <p className="snapshot-name">Name: {props.name}</p>
      <p className="snapshot-created">Created: {props.created}</p>
      <p className="snapshot-name">Size: {formatMib(props.size)}</p>
      <p className="snapshot-name">Created By User: {props.usercreated ? 'True' : 'False'}</p>
    </div>}>
    <div className="snapshot-current-desc">
      <Button>
        <Icon type="caret-right" />Volume Head
        </Button>
    </div>
    </Tooltip>) : (<div className="snapshot-current-desc">
        <Button>
          <Icon type="caret-right" />Volume Head
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
}

function SnapshotIcon(props, snapshotProps) {
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
    if (key === 'snapshotRevert') {
      return
    }
    if (key === 'snapshotBackup') {
      backupProgressModal(snapshotProps.volume.name)
    }
    doAction(key)
  }

  const title = (
    <div>
      <h3 style={{ margin: 0, padding: 0, marginTop: -2 }}> Confirm snapshot revert? </h3>
      <p style={{ marginTop: '20px' }}>Volume may not be mounted on the host when reverting,</p>
      <p>otherwise it may cause filesystem error</p>
    </div>
  )
  const menu = (
    <Menu
      className="lh-snapshot-dropdown"
      onClick={onClick}
    >
      { props.usercreated ?
        <Menu.Item className="revert-menu-item" key="snapshotRevert">
          <Popconfirm title={title} onConfirm={() => doAction('snapshotRevert')}>
            <span className="snapshot-revert">Revert</span>
          </Popconfirm>
        </Menu.Item> : ''
      }
      { props.usercreated ?
        <Menu.Item key="snapshotBackup">
          <span>Backup</span>
        </Menu.Item> : ''
      }
      <Menu.Item key="snapshotDelete">
        <span>Delete</span>
      </Menu.Item>
    </Menu>
  )
  return (
    <Dropdown
      placement="bottomRight"
      overlay={menu}
      trigger={props.removed ? [] : ['click']}
      key={props.name}
    >
      <Tooltip placement="right" autoAdjustOverflow={false} title={<div>
        <p className="snapshot-name">Name: {props.name}</p>
        <p className="snapshot-created">Created: {props.created}</p>
        <p className="snapshot-name">Size: {formatMib(props.size)}</p>
        <p className="snapshot-name">Created By User: {props.usercreated ? 'True' : 'False'}</p>
        <p className="snapshot-name">Removed: {props.removed ? 'True' : 'False'}</p>
      </div>}>
        <div>
          <div className="tree-snapshot-icon" style={{ background: props.usercreated ? '#3085d5' : 'rgb(241, 196, 15)' }} >
            <Icon className="snapshot-icon" type="camera" />
          </div>
          <div className="tree-snapshot-desc">
            <p className="snapshot-name">{props.name.substr(0, 5)}</p>
            <p className="snapshot-time">{moment(new Date(props.created)).fromNow()}</p>
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

function CurrentPoint(props) {
  function onClick() {
    props.onAction({
      type: 'snapshotCreate',
      payload: {
        volume: props.volume,
      },
    })
  }
  const menu = (
    <Menu
      onClick={onClick}
    >
      <Menu.Item key="1" disabled={disabledSnapshotAction(props.volume, props.state)}>
        <span>Take Snapshot</span>
      </Menu.Item>
    </Menu>
  )
  return (
    <Dropdown
      overlay={menu}
      trigger={['click']}
      key={props.volume.id}
    >
    {VolumeHead(props.volumeHead)}
    </Dropdown>
  )
}
CurrentPoint.propTypes = {
  onAction: PropTypes.func,
  volume: PropTypes.object,
  state: PropTypes.bool,
  volumeHead: PropTypes.object,
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
    return <TreeNode key={item.name} title={title} disabled={item.removed}>{loop(item.childrenNode, props)}</TreeNode>
  }
  return <TreeNode isLeaf key={item.name} title={title} disabled={item.removed} />
})

class Snapshot extends React.Component {
  render() {
    let props = this.props
    let children = (<TreeNode key="1" title={CurrentPoint(props)} />)
    if (props.snapshotTree.length > 0) {
      // let children = convertTree(props.snapshotTree, props)
      children = loop(props.snapshotTree, props)
    }
    return (
      <Tree
        defaultExpandAll
        className="lh-tree-snapshot"
        autoExpandParent={false}
      >
        <TreeNode className="tree-start-wrap" title={StartPoint()} key={`${props.volume.id}`}>
          {children}
        </TreeNode>
      </Tree>
    )
  }
}
Snapshot.propTypes = {
  snapshotTree: PropTypes.array,
  loading: PropTypes.bool,
  volume: PropTypes.object,
  state: PropTypes.bool,
  volumeHead: PropTypes.object,
}

export default Snapshot
