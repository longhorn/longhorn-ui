import React from 'react'
import PropTypes from 'prop-types'
import { Tooltip } from 'antd'
import upgradeIcon from '../../assets/images/upgrade.svg'
import { withTranslation } from 'react-i18next'

function EngineImageUpgradeTooltip({ t, currentVersion, latestVersion }) {
  return (<Tooltip placement="topLeft"
    title={<div>
    <p>{t('engineImageUpgradeTooltip.currentVersion', { version: currentVersion })}</p>
    <p>{t('engineImageUpgradeTooltip.latestVersionAvailable', { version: latestVersion })}</p>
  </div>}>
  <img style={{ marginRight: '5px', width: '18px', height: '18px' }} src={upgradeIcon} alt="Upgrade"></img>
</Tooltip>)
}

EngineImageUpgradeTooltip.propTypes = {
  t: PropTypes.func,
  currentVersion: PropTypes.string,
  latestVersion: PropTypes.string,
}

export default withTranslation()(EngineImageUpgradeTooltip)
