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

// TODO: convert TreeLoop to Tail Call
// let toTree = (item, props) => {
//   let title
//   if (item.name) {
//     title = SnapshotIcon(item, props)
//   } else {
//     title = CurrentPoint(props)
//     return <TreeNode key={`${props.volume.name}`} title={title} ><div></div><div></div></TreeNode>
//   }
//   return <TreeNode key={item.name} title={title} disabled={item.removed} ><div></div><div></div></TreeNode>
// }

// let convertTree = function (snapshotTree, props) {
//   let treeRootNode = []
//   if (snapshotTree.length <= 0) {
//     return treeRootNode
//   }

//   let rootNode = {
//     ...snapshotTree.find(ele => ele.parent === ''),
//   }

//   treeRootNode = toTree(rootNode, props)
//   let loopTailCall = function (treeRootNode, node, treeArry) {
//     let i = 0
//     if (i < node.children.length) {
//       let item = node.children[i]
//       node.childrenNode || (node.childrenNode = [])
//       // treeRootNode.props.children || (treeRootNode.props.children = [])
//       if (!item || item === 'volume-head') {
//         let treeChlidNode = toTree(item, props)

//         treeRootNode.props.children.push(treeChlidNode)
//         treeRootNode.props.created = item.created
//         node.childrenNode.push(
//                 'volume-head'
//                 )
//       } else {
//         let selected = treeArry.find(ele => ele.name === item)
//         let child = {
//           ...selected,
//         }
//         treeChlidNode = toTree(child, props)
//         treeRootNode.props.children.push(treeChlidNode)
//         treeRootNode.props.created = child.created

//         node.childrenNode.push(child)
//         loopTree(treeChlidNode, child, treeArry)
//       }
//       i += 1
//     } else {
//       node.childrenNode && node.childrenNode.sort((a, b) => {
//         if (a === 'volume-head') {
//           return 1
//         }
//         if (b === 'volume-head') {
//           return -1
//         }
//         return (new Date(a.created)).getTime() - (new Date(b.created)).getTime()
//       })
//       return node.childrenNode.map(el => {
//         return toTree(el)
//       })
//     }
//     for (let i = 0; i < node.children.length; i += 1) {
//       let item = node.children[i]
//       node.childrenNode || (node.childrenNode = [])
//       // treeRootNode.props.children || (treeRootNode.props.children = [])
//       if (!item || item === 'volume-head') {
//         let treeChlidNode = toTree(item, props)

//         treeRootNode.props.children.push(treeChlidNode)
//         treeRootNode.props.created = item.created
//         node.childrenNode.push(
//                 'volume-head'
//                 )
//       } else {
//         let selected = treeArry.find(ele => ele.name === item)
//         let child = {
//           ...selected,
//         }
//         treeChlidNode = toTree(child, props)
//         treeRootNode.props.children.push(treeChlidNode)
//         treeRootNode.props.created = child.created

//         node.childrenNode.push(child)
//         loopTree(treeChlidNode, child, treeArry)
//       }
//     }
//     node.childrenNode && node.childrenNode.sort((a, b) => {
//       if (a === 'volume-head') {
//         return 1
//       }
//       if (b === 'volume-head') {
//         return -1
//       }
//       return (new Date(a.created)).getTime() - (new Date(b.created)).getTime()
//     })
//     return node.childrenNode.map(el => {
//       return toTree(el)
//     })
//   }
//   let loopTree = tco(loopTailCall)

//   loopTree(treeRootNode, rootNode, snapshotTree)
//   return treeRootNode
// }


const loop = (data, props) => data.map((item) => {
  let title
  if (item.name) {
    title = SnapshotIcon(item, props)
  } else {
    title = CurrentPoint(props)
    return <TreeNode key={`${props.volume.name}`} title={title} />
  }
  if (item.childrenNode && item.childrenNode.length) {
    return <TreeNode key={item.name} title={title} disabled={item.removed}>{loop(item.childrenNode, props)}</TreeNode>
  }
  return <TreeNode key={item.name} title={title} disabled={item.removed} />
})

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

  // let children = convertTree(props.snapshotTree, props)
  let children = loop(props.snapshotTree, props)

  return (
    <Spin tip="Loading..." spinning={props.loading}>
     <Tree
       defaultExpandAll
       className="lh-tree-snapshot"
       key={`${props.volume.id}`}
      >
        <TreeNode title={StartPoint()} disabled key={`${props.volume.id}`}>
          {children}
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
