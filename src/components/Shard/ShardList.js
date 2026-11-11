import React, { useState } from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import style from '../Replica/Replica.less'
import Shard from './Shard'

function ShardList({ dataSource, hosts }) {
  const [scroll, setScroll] = useState({ start: false, end: true })

  const onScroll = ({ target }) => {
    setScroll({
      start: target.scrollLeft !== 0,
      end: target.scrollWidth - target.clientWidth !== target.scrollLeft,
    })
  }

  const cNames = classnames(style.replicaContainer, { [style.start]: scroll.start }, { [style.end]: scroll.end })
  return (
    <div onScroll={onScroll} className={cNames}>
      <div className={style.replica}>
        {dataSource.map(item => <Shard key={item.name} item={item} hosts={hosts} />)}
      </div>
    </div>
  )
}

ShardList.propTypes = {
  dataSource: PropTypes.array,
  hosts: PropTypes.array,
}

export default ShardList
