import React from 'react'
import PropTypes from 'prop-types'
import { Dropdown, Button, Icon, Menu, Tooltip } from 'antd'

const DropOption = ({ onMenuClick, menuOptions = [], buttonStyle, dropdownProps, tooltipProps }) => {
  const menu = menuOptions.map(item => {
    const tooltip = item.tooltip !== undefined ? item.tooltip : ''
    return (
      <Menu.Item key={item.key} disabled={!!item.disabled}>
        <Tooltip title={tooltip} {...tooltipProps}><div>{ item.name }</div></Tooltip>
      </Menu.Item>
    )
  })
  return (<Dropdown
    overlay={<Menu onClick={onMenuClick}>{menu}</Menu>}
    {...dropdownProps}
  >
    <Button style={{ border: 'none', ...buttonStyle }}>
      <Icon style={{ marginRight: 2 }} type="bars" />
      <Icon type="down" />
    </Button>
  </Dropdown>)
}

DropOption.propTypes = {
  onMenuClick: PropTypes.func,
  menuOptions: PropTypes.array.isRequired,
  buttonStyle: PropTypes.object,
  dropdownProps: PropTypes.object,
  tooltipProps: PropTypes.object,
}

export default DropOption
