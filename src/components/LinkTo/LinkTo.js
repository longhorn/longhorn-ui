import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'dva/router'
import { addPrefix } from '../../utils/pathnamePrefix'

export default function LinkTo({ to, children, ...props }) {
  return (
    <Link to={{ pathname: addPrefix(to.pathname), state: to.state }} {...props}>{children}</Link>
  )
}

LinkTo.propTypes = {
  to: PropTypes.object,
  children: PropTypes.any,
}
