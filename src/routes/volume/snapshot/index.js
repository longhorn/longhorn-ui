import React, { PropTypes } from 'react'
import { Snapshot } from '../../../components'
import { connect } from 'dva'

class Snapshots extends React.Component {
  componentDidMount() {
    this.props.dispatch({
      type: 'snapshotModal/queryVolume',
      payload: this.props.routeParams.id,
    })
  }
  onAction(action) {
    console.log(action)
    this.props.dispatch({
      type: 'snapshotModal/snapshotAction',
      payload: {
        url: action.payload.volume.actions[action.type],
        params: {
          name: action.payload.snapshot ? action.payload.snapshot.name : undefined,
        },
        querySnapShotUrl: this.props.volume.actions.snapshotList,
      },
    })
  }
  render() {
    if (!this.props.volume) {
      return null
    }
    // Must regenerate tree, or there are some bugs when update tree
    const SnapshotGen = () => {
      return (<Snapshot {...this.props} onAction={this.onAction.bind(this)} />)
    }
    return (
      <div style={{ padding: '20px', backgroundColor: 'white', minHeight: '400px', overflow: 'auto' }}>
        <SnapshotGen></SnapshotGen>
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
