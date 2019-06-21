import React from 'react'
import PropTypes from 'prop-types'
import { Row, Col, Popover, Icon } from 'antd'
import styles from './Header.less'
import Menus from './Menu'
import longhornLogo from '../../assets/images/longhorn-logo.svg'

function Header({ isNavbar, menuPopoverVisible, location, switchMenuPopover }) {
  const menusProps = {
    location,
    isNavbar,
    switchMenuPopover,
  }

  return (
    <div className={styles.header}>
      <Row>
        <Col className={styles.logoCol} lg={4} md={5} sm={8} xs={12}>
          <div className={styles.logoContainer}>
            <img className={styles.logo} src={longhornLogo} alt="LONGHORN" />
          </div>
        </Col>
        <Col lg={0} md={0} sm={16} xs={12}>
          {isNavbar ? <div className={styles.popupMenu}>
              <Popover placement="bottomLeft" onVisibleChange={switchMenuPopover} visible={menuPopoverVisible} overlayClassName={styles.popovermenu} trigger="click" content={<Menus {...menusProps} />}>
                <div className={styles.button}>
                  <Icon type="bars" />
                </div>
              </Popover>
            </div> : ''}
        </Col>
        <Col className={styles.menuCol} lg={20} md={19} sm={0} xs={0}>
          <Menus {...menusProps} />
        </Col>
      </Row>
    </div>
  )
}

Header.propTypes = {
  isNavbar: PropTypes.bool,
  location: PropTypes.object,
  menuPopoverVisible: PropTypes.bool,
  switchMenuPopover: PropTypes.func,
}

export default Header
