import React from 'react'
import PropTypes from 'prop-types'

function IconRemove({ width = 18, height = 18 }) {
  return (
    <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width={width} height={height}>
      <path style={{ fill: '#5ab1ef' }} d="M0 808.448V1024h215.552L839.395556 394.410667l-215.495112-215.495111L0 808.391111zM1003.918222 229.944889a54.840889 54.840889 0 0 0 0-79.416889L873.472 20.081778a54.840889 54.840889 0 0 0-79.416889 0l-102.115555 102.115555 215.552 215.495111 96.426666-107.747555z"></path>
    </svg>
  )
}

IconRemove.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
}

export default IconRemove
