import React from 'react'
import PropTypes from 'prop-types'
import { Menu, Icon } from 'antd'
import { LinkTo } from '../../components'
import { menu } from '../../utils'

const SubMenu = Menu.SubMenu
const topMenus = menu.map(item => item.key)
const getMenus = function (menuArray, siderFold) {
  return menuArray.map(item => {
    const linkTo = { pathname: `/${item.key}`, state: item.key === 'backup' }
    let menus
    let children = (item.child || []).filter(child => child.show === true)
    if (children.length > 0) {
      menus = (
        <SubMenu key={linkTo.pathname}
          title={
            <span>
              {item.icon ? <Icon type={item.icon} /> : ''}
              {siderFold && topMenus.indexOf(item.key) >= 0 ? '' : item.name}
              <Icon type="down" style={{ marginLeft: 5 }} />
            </span>
          }>
        {getMenus(item.child, false)}
        </SubMenu>
      )
    } else {
      menus = (
        <Menu.Item key={linkTo.pathname}>
          <LinkTo to={linkTo}>
            {item.icon ? <Icon type={item.icon} /> : ''}
            {siderFold && topMenus.indexOf(item.key) >= 0 ? '' : item.name}
          </LinkTo>
        </Menu.Item>
      )
    }
    return menus
  })
}

function Menus({ location, isNavbar, switchMenuPopover }) {
  const menuItems = getMenus(menu, false)
  const pathname = location.pathname
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
