import React, { PropTypes } from 'react'
import styles from './resourceDetail.less'

function ResourceDetail({ data, total, width = 300 }) {
  return (
    <div className={styles.resourceDetailContainer}>
      <div className={styles.resourceDetail} style={{ width: `${width}px` }}>
        <div className={styles.resourceDetailBody}>
        {data.map(d => (
          <div key={d.name} className={styles.detailItem}>
            <div className={styles.label}><div className={styles.badge} style={{ backgroundColor: d.color }}></div>{d.name}</div>
            <div className={styles.value}>{d.value}</div>
          </div>
        ))}
        </div>
        {total ? (
        <div className={styles.total} >
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
}

export default ResourceDetail
