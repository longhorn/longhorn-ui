import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { Tabs } from 'antd'
import { connect } from 'dva'
import { routerRedux } from 'dva/router'
import BackupVolume from './BackupVolume'
import BackupBackingImage from '../backingImage/BackupBackingImage'
import styles from './index.less'

function Backup({ dispatch, location, setting = {} }) {
  const { pathname, hash, search } = location
  const settingsMap = Object.fromEntries(setting.data.map(s => [s.id, s.value]))
  const v1DataEngineEnabled = settingsMap['v1-data-engine'] === 'true'
  const v2DataEngineEnabled = settingsMap['v2-data-engine'] === 'true'

  const tabs = [
    {
      key: 'volume',
      label: 'Volume',
      content: <BackupVolume location={location} />,
    },
    {
      key: 'backing-image',
      label: 'Backing Image',
      content:
        <BackupBackingImage persistFilterInURL location={location} v1DataEngineEnabled={v1DataEngineEnabled} v2DataEngineEnabled={v2DataEngineEnabled} />
    }
  ]
  const defaultKey = tabs[0].key
  const activeTab = hash ? hash.replace('#', '') : defaultKey

  useEffect(() => {
    if (!hash) {
      dispatch(routerRedux.replace({ pathname, hash: defaultKey, search }))
    }
  }, [hash, pathname, dispatch])

  const handleTabChange = (key) => {
    dispatch(routerRedux.replace({ pathname, hash: key }))
  }

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
  setting: PropTypes.object,
}

export default connect(({ setting }) => ({ setting }))(Backup)
