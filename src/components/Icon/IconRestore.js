import React from 'react'
import PropTypes from 'prop-types'

function IconRestore({ width = 18, height = 18, disabled = false }) {
  const colorMap = {
    enabled: {
      color1: '#5ab1ef',
      color2: '#29abe2',
    },
    disabled: {
      color1: '#dee1e3',
      color2: '99a3a8',
    },
  }
  const color = disabled ? colorMap.disabled : colorMap.enabled
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21.146 23.433" width={width} height={height}>
      <g transform="translate(-1559.621 -312.566)">
        <path style={{ fill: color.color1 }} d="M94.73,175.6v10.992a2.192,2.192,0,0,1-2.19,2.19H83.19a2.192,2.192,0,0,1-2.19-2.19V175.6h2.347v10.835h9.036V175.6Z" transform="translate(1482.291 147.218)" />
        <path style={{ fill: color.color1 }} d="M175.806,4.86h-2.347V3.647h-2.112V4.86H169V3.49a2.192,2.192,0,0,1,2.19-2.19h2.425a2.192,2.192,0,0,1,2.19,2.19Z" transform="matrix(0.839, 0.545, -0.545, 0.839, 1431.726, 219.448)" />
        <path style={{ fill: color.color1 }} d="M48,79.4H64.272v2.347H48Z" transform="matrix(0.839, 0.545, -0.545, 0.839, 1570.108, 219.833)" />
        <path style={{ fill: color.color1 }} d="M176,209h1.252v6.514H176Z" transform="translate(1391.007 116.707)" />
        <path style={{ fill: color.color1 }} d="M240,209h1.252v6.514H240Z" transform="translate(1329.51 116.707)" />
        <path style={{ fill: color.color1 }} d="M304,209h1.252v6.514H304Z" transform="translate(1268.014 116.707)" />
        <g transform="translate(1559.621 316.303)">
          <path style={{ fill: color.color2 }} d="M10.92,6.074H9.648a3.184,3.184,0,0,0-3.18-3.18H.743V1.621H6.467A4.458,4.458,0,0,1,10.92,6.074Z" transform="translate(0.202 0.441)" />
          <path style={{ fill: color.color2 }} d="M2.7,5.4,0,2.7,2.7,0l.9.9L1.8,2.7,3.6,4.5Z" />
        </g>
      </g>
    </svg>
  )
}

IconRestore.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  disabled: PropTypes.bool,
}

export default IconRestore
