import React, { PropTypes } from 'react'
import { Menu, Icon } from 'antd'
import { Link } from 'dva/router'
import { menu } from '../../utils'

const topMenus = menu.map(item => item.key)
const getMenus = function (menuArray, siderFold, parentPath = '/') {
  return menuArray.map(item => {
    const linkTo = parentPath + item.key
    if (item.child) {
      return (
        <Menu.SubMenu key={linkTo} title={<span>{item.icon ? <Icon type={item.icon} /> : ''}{siderFold && topMenus.indexOf(item.key) >= 0 ? '' : item.name}</span>}>
          {getMenus(item.child, siderFold, `${linkTo}/`)}
        </Menu.SubMenu>
      )
    }
    return (
      <Menu.Item key={linkTo}>

        <Link to={linkTo}>
          {item.icon ? <Icon type={item.icon} /> : ''}
          {siderFold && topMenus.indexOf(item.key) >= 0 ? '' : item.name}
        </Link>
      </Menu.Item>
    )
  })
}

function Menus({ location, isNavbar }) {
  const menuItems = getMenus(menu, false)

  return (
    <Menu
      mode={isNavbar ? 'inline' : 'horizontal'}
      defaultSelectedKeys={[location.pathname !== '/' ? location.pathname : '/dashboard']}
    >
      {menuItems}
    </Menu>
  )
}

Menus.propTypes = {
  location: PropTypes.object,
  isNavbar: PropTypes.bool,
}

export default Menus
