import React, { PropTypes } from 'react'
import { Link } from 'dva/router'
import { addPrefix } from '../../utils/pathnamePrefix'

export default function LinkTo({ to, children, ...props }) {
  return (
    <Link to={addPrefix(to)} {...props}>{children}</Link>
  )
}

LinkTo.propTypes = {
  to: PropTypes.string,
  children: PropTypes.any,
}
