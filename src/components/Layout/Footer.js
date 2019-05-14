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

function Footer({ app, host, volume, setting, engineimage, eventlog, dispatch }) {
  const { bundlesropsVisible, bundlesropsKey, okText, modalButtonDisabled, progressPercentage } = app
  const currentVersion = config.version === '${VERSION}' ? 'dev' : config.version // eslint-disable-line no-template-curly-in-string
  const issueTitle = '*Summarize%20your%20issue%20here*'
  const issueBody = `*Describe%20your%20issue%20here*%0A%0A---%0AVersion%3A%20\`${currentVersion}\``
  const issueHref = `https://github.com/rancher/longhorn/issues/new?title=${issueTitle}&body=${issueBody}`

  const { data } = setting
  let checkUpgrade = false
  let latestVersion = ''
  data.forEach(option => {
    switch (option.id) {
      case 'upgrade-checker':
        checkUpgrade = option.value === 'true'
        break
      case 'latest-longhorn-version':
        latestVersion = option.value
        break
      default:
        break
    }
  })
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
    onOk(data) {
      dispatch({
        type: 'app/changeOkText',
        payload: data,
      })
      dispatch({
        type: 'app/supportbundles',
        payload: data,
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

  return (
    <div className={styles.footer}>
      <Row type="flex" justify="space-between">
        <Col>
          {upgrade}
          <a>{currentVersion}</a>
          <a target="blank" href="https://github.com/rancher/longhorn#longhorn">Documentation</a>
          <a target="blank" onClick={showBundlesModel}>Generate Support Bundle</a>
          <a target="blank" href={issueHref}>File an Issue</a>
          <a target="blank" href="https://forums.rancher.com">Forums</a>
          <a target="blank" href="https://slack.rancher.io">Slack</a>
        </Col>
        <Col>
          {getStatusIcon(volume)}
          {getStatusIcon(host)}
          {getStatusIcon(setting)}
          {getStatusIcon(engineimage)}
          {getStatusIcon(eventlog)}
        </Col>
        <BundlesModel key={bundlesropsKey} {...createBundlesrops} />
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
}

export default connect(({ app, host, volume, setting, engineimage, eventlog }) => ({ app, host, volume, setting, engineimage, eventlog }))(Footer)
