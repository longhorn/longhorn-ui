import React, { PropTypes } from 'react'
import { connect } from 'dva'

function Host() {
  return (
    <div className="content-inner">
      Host
    </div>
  )
}

Host.propTypes = {
  host: PropTypes.object,
}

export default connect(({ host }) => ({ host }))(Host)
