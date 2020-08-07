import React from 'react'
import PropTypes from 'prop-types'
import { Icon, Card } from 'antd'
import { LinkTo } from '../../../components'
import styles from './numberCard.less'

function NumberCard({ icon, color, title, number, linkTo, loading }) {
  return (
    <Card className={styles.numberCard} bordered={false} bodyStyle={{ padding: 0 }}>
      <LinkTo to={{ pathname: linkTo }}>
        <Icon className={styles.iconWarp} style={{ color }} type={icon} />
        <div className={styles.content}>
          <p className={styles.title}>{title || 'No Title'}</p>
          <p className={styles.number}>
            {loading ? <Icon type="loading" /> : number}
          </p>
        </div>
      </LinkTo>
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
