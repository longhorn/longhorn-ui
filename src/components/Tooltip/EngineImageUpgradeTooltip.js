import React from 'react'
import PropTypes from 'prop-types'
import { Tooltip } from 'antd'
import upgradeIcon from '../../assets/images/upgrade.svg'

export default function EngineImageUpgradeTooltip({ currentVersion, latestVersion }) {
  return (<Tooltip placement="topLeft"
    title={<div>
    <p>Current engine image: { currentVersion }</p>
    <p>Engine image { latestVersion } is now available!</p>
  </div>}>
  <img style={{ marginRight: '5px', width: '18px', height: '18px' }} src={upgradeIcon} alt="Upgrade"></img>
</Tooltip>)
}

EngineImageUpgradeTooltip.propTypes = {
  currentVersion: PropTypes.string,
  latestVersion: PropTypes.string,
}
