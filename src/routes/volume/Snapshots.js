import React, { PropTypes } from 'react'
import { Button, Spin } from 'antd'

import { Snapshot } from '../../components'

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
      payload: this.props.volumeId,
    })
  }
  shouldComponentUpdate(nextProps) {
    if (nextProps.loading !== this.props.loading) {
      return true
    }
    // avoid unnecessary dom update
    if (nextProps.snapshotTree === this.props.snapshotTree) {
      return false
    }
    return true
  }
  componentWillUnmount() {
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
      <Spin spinning={this.props.loading}>
        <div style={{ position: 'relative', top: '0', padding: '20px', backgroundColor: 'white', minHeight: '314px', overflow: 'auto' }}>
          <Button icon="scan" onClick={() => { this.onAction({ type: 'snapshotCreate' }) }} type="primary" >
            Take Snapshot
          </Button>
          <div style={{ marginTop: '20px' }}>
            <SnapshotGen />
          </div>
        </div>
      </Spin>
    )
  }

}

Snapshots.propTypes = {
  volumeId: PropTypes.string,
  dispatch: PropTypes.func,
  volume: PropTypes.object,
  loading: PropTypes.bool,
  snapshotTree: PropTypes.array,
}

export default Snapshots
