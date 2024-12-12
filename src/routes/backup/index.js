import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { Tabs } from 'antd'
import { connect } from 'dva'
import { routerRedux } from 'dva/router'
import VolumeBackup from './VolumeBackup'
import BackupBackingImage from '../backingImage/BackupBackingImage'
import styles from './index.less'

function Backup({ dispatch, location }) {
  const { pathname, hash } = location
  const tabs = [
    {
      key: 'volume',
      label: 'Volume',
      content: <VolumeBackup location={location} />,
    },
    {
      key: 'backing-image',
      label: 'Backing Image',
      content:
        <BackupBackingImage
          className={styles.backupBackingImage}
          location={location}
          height="calc(100% - 48px)"
        />
    }
  ]
  const defaultKey = tabs[0].key

  useEffect(() => {
    if (!hash) {
      dispatch(routerRedux.replace({ pathname, hash: defaultKey }))
    }
  }, [hash, pathname, dispatch])

  const handleTabChange = (key) => {
    dispatch(routerRedux.replace({ pathname, hash: key }))
  }

  const activeTab = hash ? hash.replace('#', '') : defaultKey

  return (
    <Tabs
      className={styles.container}
      type="card"
      defaultActiveKey={defaultKey}
      activeKey={activeTab}
      onChange={handleTabChange}
    >
      {tabs.map((tab) => (
        <Tabs.TabPane tab={tab.label} key={tab.key}>
          {tab.content}
        </Tabs.TabPane>
      ))}
    </Tabs>
  )
}

Backup.propTypes = {
  location: PropTypes.object,
  dispatch: PropTypes.func,
}

export default connect()(Backup)
