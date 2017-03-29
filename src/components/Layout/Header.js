import React, { PropTypes } from 'react'
import { Row, Col } from 'antd'
import styles from './Header.less'
import Menus from './Menu'

function Header({ location }) {
  const menusProps = {
    location,
  }
  return (
    <div className={styles.header}>
      <Row>
        <Col className={styles.logoCol} lg={4} md={5} sm={24} xs={24}>
          <div className={styles.logo}><h1>LONGHORN</h1></div>
        </Col>
        <Col className={styles.menuCol} lg={20} md={19} sm={0} xs={0}>
          <Menus {...menusProps} />
        </Col>
      </Row>
    </div>
  )
}

Header.propTypes = {
  location: PropTypes.object,
}

export default Header
