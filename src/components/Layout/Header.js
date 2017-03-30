import React, { PropTypes } from 'react'
import { Row, Col, Popover, Icon } from 'antd'
import styles from './Header.less'
import Menus from './Menu'

function Header({ isNavbar, menuPopoverVisible, location, switchMenuPopover }) {
  const menusProps = {
    location,
    isNavbar,
    switchMenuPopover,
  }

  return (
    <div className={styles.header}>
      <Row>
        <Col className={styles.logoCol} lg={4} md={5} sm={24} xs={24}>
          <div className={styles.logo}>
            <h1>LONGHORN</h1>
          </div>
          {isNavbar ?
            <div className={styles.popupMenu}>
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
