import React, { PropTypes } from 'react'
import { connect } from 'dva'
import { Row, Col } from 'antd'
import styles from './Footer.less'
import { config } from '../../utils'
import { getStatusIcon } from '../../utils/websocket'

function Footer({ host, volume, setting, engineimage }) {
  const version = config.version === '${VERSION}' ? 'dev' : config.version // eslint-disable-line no-template-curly-in-string
  const issueTitle = '*Summarize%20your%20issue%20here*'
  const issueBody = `*Describe%20your%20issue%20here*%0A%0A---%0AVersion%3A%20\`${version}\``
  const issueHref = `https://github.com/rancher/longhorn/issues/new?title=${issueTitle}&body=${issueBody}`

  return (
    <div className={styles.footer}>
      <Row type="flex" justify="space-between">
        <Col>
          <a>{version}</a>
          <a target="blank" href="https://github.com/rancher/longhorn#longhorn">Documentation</a>
          <a target="blank" href={issueHref}>File an Issue</a>
          <a target="blank" href="https://forums.rancher.com">Forums</a>
          <a target="blank" href="https://slack.rancher.io">Slack</a>
        </Col>
        <Col>
          {getStatusIcon(volume)}
          {getStatusIcon(host)}
          {getStatusIcon(setting)}
          {getStatusIcon(engineimage)}
        </Col>
      </Row>
    </div>
  )
}

Footer.propTypes = {
  host: PropTypes.object,
  volume: PropTypes.object,
  setting: PropTypes.object,
  engineimage: PropTypes.object,
}

export default connect(({ host, volume, setting, engineimage }) => ({ host, volume, setting, engineimage }))(Footer)
