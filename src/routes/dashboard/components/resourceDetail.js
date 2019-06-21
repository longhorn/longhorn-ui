import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import styles from './resourceDetail.less'

function ResourceDetail({ data, total, width = 300, onClick = f => f, onMouseEnter = f => f, onMouseLeave = f => f, clickable }) {
  return (
    <div className={styles.resourceDetailContainer}>
      <div className={styles.resourceDetail} style={{ width: `${width}px` }}>
        <div className={styles.resourceDetailBody}>
        {data.map((d, index) => (
          <div key={d.name} className={classnames(styles.detailItem, { [styles.clickable]: clickable })} onMouseEnter={e => onMouseEnter(d, index, e)} onMouseLeave={e => onMouseLeave(d, index, e)}>
            <div className={styles.detailContent} onClick={() => onClick(d)}>
              <div className={styles.label}>
              <div className={styles.badge} style={{ backgroundColor: d.color }}></div>
              {d.name}
              </div>
              <div>{d.value}</div>
            </div>
          </div>
        ))}
        </div>
        {total ? (
        <div className={styles.total}>
          <div>{total.name}</div>
          <div>{total.value}</div>
        </div>
        ) : null}
      </div>
    </div>
  )
}
ResourceDetail.propTypes = {
  total: PropTypes.object,
  data: PropTypes.array,
  width: PropTypes.number,
  onClick: PropTypes.func,
  clickable: PropTypes.bool,
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func,
}

export default ResourceDetail
