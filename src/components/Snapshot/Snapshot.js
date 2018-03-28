import React, { PropTypes } from 'react'
import { Tree, Icon, Menu, Dropdown, Button, Popconfirm } from 'antd'
import moment from 'moment'
import './Snapshot.less'

const TreeNode = Tree.TreeNode

function StartPoint() {
  return (
    <div className="tree-snapshot-start-point">
    </div>
  )
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
      <Menu.Item className="revert-menu-item" key="snapshotRevert">
        <Popconfirm title={title} onConfirm={() => doAction('snapshotRevert')}>
          <span className="snapshot-revert">Revert</span>
        </Popconfirm>
      </Menu.Item>
      <Menu.Item key="snapshotBackup">
        <span>Backup</span>
      </Menu.Item>
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
      <div>
        <div className="tree-snapshot-icon">
          <Icon className="snapshot-icon" type="camera" />
        </div>
        <div className="tree-snapshot-desc">
          <p className="snapshot-name">{props.name.substr(0, 5)}</p>
          <p className="snapshot-time">{moment(new Date(props.created)).fromNow()}</p>
        </div>
      </div>
    </Dropdown>
  )
}
SnapshotIcon.propTypes = {
  removed: PropTypes.bool,
  name: PropTypes.string,
  created: PropTypes.string,
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
      <Menu.Item key="1" disabled={!props.volume.actions || !props.volume.actions.snapshotCreate}>
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
      <div className="snapshot-current-desc">
        <Button>
          <Icon type="caret-right" />Live Volume
          </Button>
      </div>
    </Dropdown>
  )
}
CurrentPoint.propTypes = {
  onAction: PropTypes.func,
  volume: PropTypes.object,
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
        <TreeNode className="tree-start-wrap" title={StartPoint()} disabled key={`${props.volume.id}`}>
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
}

export default Snapshot
