import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Row, Col, Tooltip } from 'antd'
import styles from './Footer.less'
import { config } from '../../utils'
import { getStatusIcon } from '../../utils/websocket'
import upgradeIcon from '../../assets/images/upgrade.svg'
import semver from 'semver'
import BundlesModel from './BundlesModel'
import StableLonghornVersions from './StableLonghornVersions'

function Footer({ app, host, volume, setting, engineimage, eventlog, backingImage, recurringJob, backup, systemBackups, dispatch }) {
  const { bundlesropsVisible, bundlesropsKey, stableLonghornVersionslVisible, stableLonghornVersionsKey, okText, modalButtonDisabled, progressPercentage } = app
  const currentVersion = config.version === '${VERSION}' ? 'dev' : config.version // eslint-disable-line no-template-curly-in-string
  const issueHref = 'https://github.com/longhorn/longhorn/issues/new/choose'

  const { data } = setting
  let checkUpgrade = false
  let latestVersion = ''
  let stableLonghornVersions = ''
  let stableLonghornVersionsList = []
  data.forEach(option => {
    switch (option.id) {
      case 'upgrade-checker':
        checkUpgrade = option.value === 'true'
        break
      case 'latest-longhorn-version':
        latestVersion = option.value
        break
      case 'stable-longhorn-versions':
        stableLonghornVersions = option.value
        break
      default:
        break
    }
  })
  if (stableLonghornVersions) stableLonghornVersionsList = stableLonghornVersions.split(',')
  let gtCurrentLonghornVersionsList = stableLonghornVersionsList.filter((item) => {
    let stableVersion = semver.valid(item)
    if (!semver.valid(currentVersion)) return true
    return stableVersion && semver.valid(currentVersion) && semver.gt(stableVersion, semver.valid(currentVersion))
  })
  let gtStableLonghornVersions = gtCurrentLonghornVersionsList.join(', ')
  if (gtCurrentLonghornVersionsList && gtCurrentLonghornVersionsList.length > 3) {
    gtStableLonghornVersions = gtCurrentLonghornVersionsList.slice(0, 3).join(' ')
    gtStableLonghornVersions += ', ...'
  }
  let versionTag = false
  semver.valid(currentVersion) && semver.valid(latestVersion) ? versionTag = semver.lt(currentVersion, latestVersion) : versionTag = false
  let upgrade = ''
  if (checkUpgrade && currentVersion !== 'dev' && latestVersion !== '' && versionTag) {
    const upgradeTooltip = `Longhorn ${latestVersion} is now available!`
    upgrade = (
      <Tooltip placement="topLeft" title={upgradeTooltip}>
        <img src={upgradeIcon} alt="Upgrade"></img>
      </Tooltip>
    )
  }

  const createBundlesrops = {
    item: {},
    visible: bundlesropsVisible,
    okText,
    modalButtonDisabled,
    progressPercentage,
    onOk(_data) {
      dispatch({
        type: 'app/changeOkText',
        payload: _data,
      })
      dispatch({
        type: 'app/supportbundles',
        payload: _data,
      })
    },
    onCancel() {
      dispatch({
        type: 'app/hideBundlesModel',
      })
    },
  }

  const showBundlesModel = () => {
    dispatch({
      type: 'app/showBundlesModel',
    })
  }

  const showStableLonghornVersions = () => {
    dispatch({
      type: 'app/showStableLonghornVersions',
    })
  }

  const stableLonghornVersionsProps = {
    visible: stableLonghornVersionslVisible,
    versions: gtCurrentLonghornVersionsList || [],
    onOk: () => {
      dispatch({
        type: 'app/hideStableLonghornVersions',
      })
    },
    onCancel: () => {
      dispatch({
        type: 'app/hideStableLonghornVersions',
      })
    },
  }

  return (
    <div className={styles.footer}>
      <Row type="flex" justify="space-between">
        <Col>
          {upgrade}
          <a>{currentVersion}</a>
          <a target="blank" href="https://longhorn.io/docs">Documentation</a>
          <a target="blank" onClick={showBundlesModel}>Generate Support Bundle</a>
          <a target="blank" href={issueHref}>File an Issue</a>
          <a target="blank" href="https://slack.cncf.io/">Slack</a>
          {gtCurrentLonghornVersionsList && gtCurrentLonghornVersionsList.length > 0 ? <a target="blank" onClick={showStableLonghornVersions}>{`Newer Stable Versions (${gtStableLonghornVersions})`}</a> : ''}
        </Col>
        <Col>
          {getStatusIcon(volume)}
          {getStatusIcon(host)}
          {getStatusIcon(setting)}
          {getStatusIcon(engineimage)}
          {getStatusIcon(eventlog)}
          {getStatusIcon(backingImage, 'backingImages')}
          {getStatusIcon(backingImage, 'backupBackingImages')}
          {getStatusIcon(recurringJob)}
          {getStatusIcon(backup, 'backupVolumes')}
          {getStatusIcon(backup, 'backups')}
          {getStatusIcon(systemBackups, 'systemBackup')}
          {getStatusIcon(systemBackups, 'systemRestore')}
        </Col>
        <BundlesModel key={bundlesropsKey} {...createBundlesrops} />
        <StableLonghornVersions key={stableLonghornVersionsKey} {...stableLonghornVersionsProps} />
      </Row>
    </div>
  )
}

Footer.propTypes = {
  host: PropTypes.object,
  volume: PropTypes.object,
  setting: PropTypes.object,
  engineimage: PropTypes.object,
  eventlog: PropTypes.object,
  backingImage: PropTypes.object,
  recurringJob: PropTypes.object,
  app: PropTypes.object,
  backup: PropTypes.object,
  systemBackups: PropTypes.object,
  dispatch: PropTypes.func,
}

export default connect(({ app, host, volume, setting, engineimage, eventlog, backingImage, recurringJob, backup, systemBackups }) => ({ app, host, volume, setting, engineimage, eventlog, backingImage, recurringJob, backup, systemBackups }))(Footer)
