import React, { PropTypes } from 'react'
import { connect } from 'dva'

function Backup() {
  return (
    <div className="content-inner">
      Backup
    </div>
  )
}

Backup.propTypes = {
  backup: PropTypes.object,
}

export default connect(({ backup }) => ({ backup }))(Backup)
