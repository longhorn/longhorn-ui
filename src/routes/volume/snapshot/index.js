import React, { PropTypes } from 'react'
import { connect } from 'dva'
import Snapshots from '../Snapshots'

function Snapshot2({ dispatch, routeParams, snapshotModal }) {
  const props = {
    ...snapshotModal,
    dispatch,
    volumeId: routeParams.id,
  }
  return (
    <Snapshots {...props} />
  )
}

Snapshot2.propTypes = {
  dispatch: PropTypes.func,
  routeParams: PropTypes.object,
  volume: PropTypes.object,
  loading: PropTypes.bool,
  snapshotModal: PropTypes.object,
}

export default connect(({ snapshotModal }) => ({ snapshotModal }))(Snapshot2)
