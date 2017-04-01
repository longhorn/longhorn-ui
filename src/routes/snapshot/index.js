import React, { PropTypes } from 'react'
import { connect } from 'dva'
import { Row, Col, Input, Timeline, Steps, Tree, Icon } from 'antd'

import style from './snapshot.less'

let Step = Steps.Step
const TreeNode = Tree.TreeNode

let timeline = (n) => {
  let items = []
  for (let i = 0; i < n.length; i++) {
    items.push(
        <Timeline.Item key={i}>snapshot{i}</Timeline.Item>
      )
  }
  return (
      <Timeline>
        {items}
      </Timeline>
  )
}

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
class Setting extends React.Component {
  render() {
    return (
        <div className="content-inner">
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
                <TreeNode title={icon()} key="0-0-1">
                  <TreeNode title={icon()} key="0-0-1-0" />
                  <TreeNode title={icon()} key="0-0-1-3" >
                    <TreeNode title={icon()} key="0-0-1-3-1" />
                    <TreeNode title={icon()} key="0-0-1-3-2" />
                  </TreeNode>
                  <TreeNode title={icon()} key="0-0-0">
                  <TreeNode title={icon()} key="0-0-0-0" />
                  <TreeNode title={icon()} key="0-0-0-1" />
                  <TreeNode title={icon()} key="0-0-0-2" />
                  </TreeNode>
                  <TreeNode title={icon()} key="0-0-8">
                    <TreeNode title={icon()} key="0-0-8-0" />
                    <TreeNode title={icon()} key="0-0-8-1" />
                    <TreeNode title={icon()} key="0-0-8-2" />
                  </TreeNode>
                </TreeNode>
                <TreeNode title={icon()} key="b-b-b">
                </TreeNode>
              </TreeNode>
            </Tree>
        </div>
    )
  }
}

Setting.propTypes = {
  snapshot: PropTypes.object,
}

export default connect(({ snapshot }) => ({ snapshot }))(Setting)
