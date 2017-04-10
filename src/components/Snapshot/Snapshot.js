import React, { PropTypes } from 'react'
import { Tree, Icon, Menu, Dropdown, Button, Spin } from 'antd'
import moment from 'moment'

const TreeNode = Tree.TreeNode

function StartPoint() {
  return (
      <div className="tree-snapshot-start-point">
      </div>
  )
}
function SnapshotIcon(props, snapshotProps) {
  function onClick({ key }) {
    snapshotProps.onAction({
      type: key,
      payload: {
        volume: snapshotProps.volume,
        snapshot: props,
      },
    })
  }
  const menu = (
    <Menu
      className="lh-snapshot-dropdown"
      onClick={onClick}
    >
      <Menu.Item key="snapshotRevert">
        <span>Revert</span>
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
      <Menu.Item key="1">
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
function Snapshot(props) {
  if (props.snapshotTree.length <= 0) {
    return (
    <Spin tip="Loading..." spinning={props.loading}>
      <Tree
        defaultExpandAll
        className="lh-tree-snapshot"
        key={`00${props.volume.id}`}
      >
        <TreeNode title={StartPoint()} disabled key={`11${props.volume.id}`}>
          <TreeNode key="1" title={CurrentPoint(props)} />
        </TreeNode>
      </Tree>
    </Spin>
    )
  }
  const loop = data => data.map((item) => {
    let title
    if (item.name) {
      title = SnapshotIcon(item, props)
    } else {
      title = CurrentPoint(props)
      return <TreeNode key={`${props.volume.name}`} title={title} />
    }
    if (item.childrenNode && item.childrenNode.length) {
      return <TreeNode key={item.name} title={title} disabled={item.removed}>{loop(item.childrenNode)}</TreeNode>
    }
    return <TreeNode key={item.name} title={title} disabled={item.removed} />
  })
  return (
    <Spin tip="Loading..." spinning={props.loading}>
     <Tree
       defaultExpandAll
       className="lh-tree-snapshot"
       key={`${props.volume.id}`}
      >
        <TreeNode title={StartPoint()} disabled key={`${props.volume.id}`}>
          { loop(props.snapshotTree) }
        </TreeNode>
      </Tree>
    </Spin>
  )
}

Snapshot.propTypes = {
  snapshotTree: PropTypes.array,
  loading: PropTypes.bool,
  volume: PropTypes.object,
}

export default Snapshot
