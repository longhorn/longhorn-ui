import React from 'react'
import PropTypes from 'prop-types'

function IconRemove({ width = 18, height = 18, disabled = false }) {
  const colorMap = {
    enabled: '#5ab1ef',
    disabled: '#dee1e3',
  }
  const color = disabled ? colorMap.disabled : colorMap.enabled
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16.272 20" width={width} height={height}>
      <g id="trash" transform="translate(-48 -1.3)">
        <path style={{ fill: color }} d="M94.73,175.6v10.992a2.192,2.192,0,0,1-2.19,2.19H83.19a2.192,2.192,0,0,1-2.19-2.19V175.6h2.347v10.835h9.036V175.6Z" transform="translate(-31.709 -167.482)" />
        <path style={{ fill: color }} d="M175.806,4.86h-2.347V3.647h-2.112V4.86H169V3.49a2.192,2.192,0,0,1,2.19-2.19h2.425a2.192,2.192,0,0,1,2.19,2.19Z" transform="translate(-116.267)" />
        <path style={{ fill: color }} d="M48,79.4H64.272v2.347H48Z" transform="translate(0 -75.045)" />
        <path style={{ fill: color }} d="M176,209h1.252v8.1H176Z" transform="translate(-122.993 -199.576)" />
        <path style={{ fill: color }} d="M240,209h1.252v8.1H240Z" transform="translate(-184.49 -199.576)" />
        <path style={{ fill: color }} d="M304,209h1.252v8.1H304Z" transform="translate(-245.986 -199.576)" />
      </g>
    </svg>
  )
}

IconRemove.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  disabled: PropTypes.bool,
}

export default IconRemove
