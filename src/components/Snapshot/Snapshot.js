import React, { PropTypes } from 'react'
import { Tree, Icon } from 'antd'

const TreeNode = Tree.TreeNode

function icon() {
  return (
    <div>
      <div style={{ position: 'relative', width: '30px', height: '30px', display: 'inline-block', borderRadius: '50%', backgroundColor: 'hsl(209, 66%, 51%)' }}>
        <Icon style={{ lineHeight: '25px', width: '25px', height: '25px', position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, margin: 'auto', fontSize: '20px', color: 'white' }} type="camera" />
      </div>
      <div style={{ lineHeight: '15px', verticalAlign: 'super', marginLeft: '10px', fontSize: '10px', display: 'inline-block' }}>
        <p style={{ fontSize: '120%' }}>SnapShot Name</p>
        <p style={{ color: '#a4a4a4' }}>13:02:04 2017-04-04</p>
      </div>
    </div>
  )
}

class Snapshot extends React.Component {
  render() {
    return (
      <div>
        <Tree
          defaultExpandAll
          ref="snapshotTree"
          id="snapshotTree"
        >
          <TreeNode title={icon()} key="0-0">
            <TreeNode title={icon()} key="0-0-2">
              <TreeNode title={icon()} key="0-0-2-0" />
              <TreeNode title={icon()} key="0-0-1-1" />
              <TreeNode title={icon()} key="0-0-1-2" />
            </TreeNode>
            <TreeNode title={icon()} key="b-b-b" />
          </TreeNode>
        </Tree>
      </div>
    )
  }
}

Snapshot.propTypes = {
  snapshot: PropTypes.object,
}

export default Snapshot
