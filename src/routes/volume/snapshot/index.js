import React, { PropTypes } from 'react'
import { Button, Icon, Tooltip } from 'antd'
import { connect } from 'dva'

import { Snapshot } from '../../../components'

class Snapshots extends React.Component {
  constructor(props) {
    super(props)
    this.onAction = (action) => {
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
      payload: this.props.routeParams.id,
    })
  }
  componentWillUnmount() {
    console.log('unmount')
    this.props.dispatch({ type: 'snapshotModal/setSnapshot', payload: [] })
  }
  render() {
    if (!this.props.volume) {
      return null
    }
    // Must regenerate tree, or there are some bugs when update tree
    const SnapshotGen = () => {
      return (<Snapshot {...this.props} onAction={this.onAction} />)
    }
    return (
      <div style={{ position: 'relative', top: '0', padding: '20px', backgroundColor: 'white', minHeight: '400px', overflow: 'auto' }}>
        <SnapshotGen />
        <div style={{ position: 'absolute', right: '50px', bottom: '50px', fontSize: '150%' }}>
          <div style={{ position: 'fixed', fontSize: '100%' }}>
            <Tooltip placement="top" title="Take Snapshot">
              <Button onClick={() => { this.onAction({ type: 'snapshotCreate' }) }} type="primary" shape="circle" >
                <Icon type="scan" />
              </Button>
            </Tooltip>
          </div>
        </div>
      </div>
    )
  }

}

Snapshots.propTypes = {
  dispatch: PropTypes.func,
  routeParams: PropTypes.object,
  volume: PropTypes.object,
}

export default connect(({ snapshotModal }) => ({ ...snapshotModal }))(Snapshots)
