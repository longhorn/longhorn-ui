import React, { PropTypes } from 'react'
import { connect } from 'dva'

function VolumeDetail({ volumeId }) {
  console.log(volumeId)

  return (
    <div className="content-inner">
      <div>
        <h1>Volume Detail</h1>
      </div>
    </div>
  )
}

VolumeDetail.propTypes = {
  volume: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
  host: PropTypes.object,
  volumeId: PropTypes.string,
}

function mapStateToProps(state, ownProps) {
  return {
    ...state,
    volumeId: ownProps.params.id,
  }
}
export default connect(mapStateToProps)(VolumeDetail)
