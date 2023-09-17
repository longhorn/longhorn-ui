import React from 'react'
import PropTypes from 'prop-types'
import { Menu } from 'antd'
import { LinkTo } from '../../components'
import { menu } from '../../utils'
import {
  BarChartOutlined, DatabaseOutlined,
  DownCircleOutlined,
  FileImageOutlined,
  LaptopOutlined,
  SettingOutlined,
  HistoryOutlined,
  CopyOutlined,
  ApiOutlined,
  ProfileOutlined,
  ApartmentOutlined,
  FileSyncOutlined,
} from '@ant-design/icons'

const SubMenu = Menu.SubMenu
const topMenus = menu.map(item => item.key)

const getIcon = iconText => {
  if (iconText === 'bar-chart') {
    return <BarChartOutlined />
  } else if (iconText === 'laptop') {
    return <LaptopOutlined />
  } else if (iconText === 'database') {
    return <DatabaseOutlined />
  } else if (iconText === 'history') {
    return <HistoryOutlined />
  } else if (iconText === 'copy') {
    return <CopyOutlined />
  } else if (iconText === 'setting') {
    return <SettingOutlined />
  } else if (iconText === 'api') {
    return <ApiOutlined />
  } else if (iconText === 'profile') {
    return <ProfileOutlined />
  } else if (iconText === 'file-image') {
    return <FileImageOutlined />
  } else if (iconText === 'apartment') {
    return <ApartmentOutlined />
  } else if (iconText === 'file-sync') {
    return <FileSyncOutlined />
  } else {
    return <span />
  }
}

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
              {item.icon ? getIcon(item.icon) : ''}
              {siderFold && topMenus.indexOf(item.key) >= 0 ? '' : item.name}
              <DownCircleOutlined />
            </span>
          }>
        {getMenus(item.child, false)}
        </SubMenu>
      )
    } else {
      menus = (
        <Menu.Item key={linkTo.pathname}>
          <LinkTo to={linkTo}>
            {item.icon ? getIcon(item.icon) : ''}
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
