import React, { PropTypes } from 'react'
import { Menu, Icon } from 'antd'
import { LinkTo } from '../../components'
import { menu } from '../../utils'
import { getPrefix } from '../../utils/pathnamePrefix'

const topMenus = menu.map(item => item.key)
const getMenus = function (menuArray, siderFold) {
  return menuArray.map(item => {
    const linkTo = `/${item.key}`
    return (
      <Menu.Item key={linkTo}>
        <LinkTo to={linkTo}>
          {item.icon ? <Icon type={item.icon} /> : ''}
          {siderFold && topMenus.indexOf(item.key) >= 0 ? '' : item.name}
        </LinkTo>
      </Menu.Item>
    )
  })
}

function Menus({ location, isNavbar, switchMenuPopover }) {
  const menuItems = getMenus(menu, false)
  const pathname = location.pathname.substr(getPrefix().length)
  const activeClass = (pathname && pathname !== '/') ? `/${pathname.split('/').filter(item => item && item !== '/')[0]}` : '/dashboard'
  return (
    <Menu
      mode={isNavbar ? 'inline' : 'horizontal'}
      onSelect={switchMenuPopover}
      selectedKeys={[activeClass]}
    >
      {menuItems}
    </Menu>
  )
}

Menus.propTypes = {
  location: PropTypes.object,
  isNavbar: PropTypes.bool,
  switchMenuPopover: PropTypes.func,
}

export default Menus
