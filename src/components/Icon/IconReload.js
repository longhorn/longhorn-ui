import React from 'react'
import PropTypes from 'prop-types'

function IconRemove({ width = 18, height = 18 }) {
  return (
    <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width={width} height={height}>
      <path style={{ fill: '#5ab1ef' }} d="M954 504q-2-15-14.5-23.5t-27-6-23 14.5-6.5 27q5 28 5 60 0 76-28.5 144.5T778 842t-122 81.5T512 952t-144-28.5T246 842t-81.5-122T136 576t28.5-144T246 310t122-81.5T512 200h13l-82 82q-11 11-11 25.5t10.5 25.5 25.5 11 26-11l135-136q11-10 11-25t-11-26L494 11Q483 0 468 0t-25.5 10.5T432 36t11 25l66 67q-89 1-171 35-81 34-143 96T99 402q-35 83-35 174t35 174q34 81 96 143t143 96q83 35 174 35t174-35q81-34 143-96t96-142q35-83 35-175 0-37-6-72z"></path>
    </svg>
  )
}

IconRemove.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
}

export default IconRemove
