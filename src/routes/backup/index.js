import React from 'react'
import PropTypes from 'prop-types'
import VolumeBackup from './VolumeBackup'

function Backup({ dispatch, location }) {
  return (
    <VolumeBackup dispatch={dispatch} location={location} />
  )
}

Backup.propTypes = {
  location: PropTypes.object,
  dispatch: PropTypes.func,
}

export default Backup
