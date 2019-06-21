import React from 'react'
import PropTypes from 'prop-types'

function IconBackup({ width = 18, height = 18, fill = '#00C1DE' }) {
  return (
    <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width={width} height={height}>
      <path fill={fill} d="M512 576 768 320 576 320 576 64 448 64 448 320 256 320zM744.736 471.264 672.992 543.008 933.056 640 512 797.024 90.944 640 351.008 543.008 279.264 471.264 0 576 0 832 512 1024 1024 832 1024 576z"></path>
    </svg>
  )
}

IconBackup.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  fill: PropTypes.string,
}

export default IconBackup
