import React from 'react'
import PropTypes from 'prop-types'

function IconNoRelation({ width = 18, height = 18 }) {
  return (
    <svg viewBox="0 0 1024 1024" width={width} height={height} xmlns="http://www.w3.org/2000/svg">
      <path d="M768 768H256V256h512m0-85.333333H256a85.333333 85.333333 0 0 0-85.333333 85.333333v512a85.333333 85.333333 0 0 0 85.333333 85.333333h512a85.333333 85.333333 0 0 0 85.333333-85.333333V256a85.333333 85.333333 0 0 0-85.333333-85.333333z" fill="rgb(241, 196, 15)"></path>
    </svg>
  )
}

IconNoRelation.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
}

export default IconNoRelation
