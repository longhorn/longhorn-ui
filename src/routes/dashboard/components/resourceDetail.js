import React, { PropTypes } from 'react'
import classnames from 'classnames'
import styles from './resourceDetail.less'

function ResourceDetail({ data, total, width = 300, onClick = f => f, clickable }) {
  return (
    <div className={styles.resourceDetailContainer}>
      <div className={styles.resourceDetail} style={{ width: `${width}px` }}>
        <div className={styles.resourceDetailBody}>
        {data.map(d => (
          <div key={d.name} className={classnames(styles.detailItem, { [styles.clickable]: clickable })}>
            <div className={styles.detailContent} onClick={() => onClick(d)}>
              <div className={styles.label}><div className={styles.badge} style={{ backgroundColor: d.color }}></div>{d.name}</div>
              <div className={styles.value}>{d.value}</div>
            </div>
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
  onClick: PropTypes.func,
  clickable: PropTypes.bool,
}

export default ResourceDetail
