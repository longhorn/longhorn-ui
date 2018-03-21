import React, { PropTypes } from 'react'
import { Icon, Card } from 'antd'
import { Link } from 'dva/router'
import styles from './numberCard.less'

function NumberCard({ icon, color, title, number, linkTo, loading }) {
  return (
    <Card className={styles.numberCard} bordered={false} bodyStyle={{ padding: 0 }}>
      <Link to={linkTo}>
        <Icon className={styles.iconWarp} style={{ color }} type={icon} />
        <div className={styles.content}>
          <p className={styles.title}>{title || 'No Title'}</p>
          <p className={styles.number}>
            {loading ? <Icon type="loading" /> : number}
          </p>
        </div>
      </Link>
    </Card>
  )
}

NumberCard.propTypes = {
  icon: PropTypes.string,
  color: PropTypes.string,
  title: PropTypes.string,
  number: PropTypes.number,
  linkTo: PropTypes.string,
  loading: PropTypes.bool,
}

export default NumberCard
