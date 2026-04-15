import React from 'react'
import PropTypes from 'prop-types'
import { Icon } from 'antd'
import { ModalBlur } from '../../components'
import { withTranslation } from 'react-i18next'

const modal = ({
  visible,
  onCancel,
  onOk,
  changedSettings,
  t,
}) => {
  const modalOpts = {
    title: t('leaveSettingsModal.title'),
    visible,
    onCancel,
    onOk,
    okText: t('leaveSettingsModal.okText'),
  }

  return (
    <ModalBlur {...modalOpts}>
      <p type="warning">
        <Icon style={{ marginRight: '10px' }} type="exclamation-circle" />
        {t('leaveSettingsModal.unsavedChangesMessage')}
      </p>
      <ul>
        {Object.keys(changedSettings).sort().map((key) => (
          <li key={key}>
            {`${key}`} : <strong>{`${changedSettings[key]}`}</strong>
          </li>
        ))}
      </ul>
      <p>{t('leaveSettingsModal.confirmMessage')}</p>
    </ModalBlur>
  )
}

modal.propTypes = {
  visible: PropTypes.bool,
  onCancel: PropTypes.func,
  onOk: PropTypes.func,
  changedSettings: PropTypes.object,
  t: PropTypes.func,
}

export default withTranslation()(modal)
