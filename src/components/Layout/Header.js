import React from 'react'
import PropTypes from 'prop-types'
import { Row, Col, Popover, Icon } from 'antd'
import styles from './Header.less'
import Menus from './Menu'
import { IS_SECURE } from '../../utils/constants'
import longhornLogo from '../../assets/images/longhorn-logo.svg'
import suseStorageLogo from '../../assets/images/suse-storage.svg'

function Header({ isNavbar, menuPopoverVisible, location, switchMenuPopover }) {
  const menusProps = {
    location,
    isNavbar,
    switchMenuPopover,
  }

  return (
    <div className={styles.header}>
      <Row align="middle">
        <Col className={styles.logoCol}>
          {
            IS_SECURE
              ? <img src={suseStorageLogo} alt="SUSE Storage" />
              : <img src={longhornLogo} alt="LONGHORN" />
          }
        </Col>
        <Col className={styles.menuCol} lg={16} md={16} sm={0} xs={0}>
          <Menus {...menusProps} />
        </Col>
        {/* popup menu for small device */}
        <Col className={styles.popupMenuCol} md={0}>
          {isNavbar
            && <Popover
              placement="bottomLeft"
              onVisibleChange={switchMenuPopover}
              visible={menuPopoverVisible}
              overlayClassName={styles.popupMenu}
              trigger="click"
              content={<Menus {...menusProps}
              />}>
              <div className={styles.button}>
                <Icon type="bars" />
              </div>
            </Popover>
          }
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
