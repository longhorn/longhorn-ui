import React from 'react'
import PropTypes from 'prop-types'
import { List } from 'antd'
import { ModalBlur } from '../../components'
import { withTranslation } from 'react-i18next'

const modal = ({
  visible,
  versions,
  onOk,
  onCancel,
  t
}) => {
  const title = (<div>
    <div>{t('stableVersions.title')}</div>
    <small style={{ color: '#9c9c9c' }}>
      {t('stableVersions.description.beforeLink')}{' '}
      <a
        target="blank"
        href="https://github.com/longhorn/longhorn/releases"
      >
        {t('stableVersions.description.link')}
      </a>
    </small>
  </div>)
  const modalOpts = {
    title,
    visible,
    onOk,
    onCancel,
    hasOnCancel: true,
  }

  return (
    <ModalBlur {...modalOpts}>
      <div style={{ maxHeight: 800, overflow: 'auto' }}>
        <List
          bordered
          dataSource={versions}
          renderItem={item => (<List.Item>{item}</List.Item>)} />
      </div>
    </ModalBlur>
  )
}

modal.propTypes = {
  t: PropTypes.func,
  visible: PropTypes.bool,
  versions: PropTypes.array,
  onOk: PropTypes.func,
  onCancel: PropTypes.func,
}

export default withTranslation()(modal)
