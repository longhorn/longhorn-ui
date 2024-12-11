import React from 'react'
import PropTypes from 'prop-types'
import { Tabs } from 'antd'
import VolumeBackup from './VolumeBackup'
import styles from './index.less'

function Backup({ dispatch, location }) {
  const tabs = [
    {
      key: 'volume',
      label: 'Volume',
      content: <VolumeBackup dispatch={dispatch} location={location} />,
    },
    {
      key: 'backing-image',
      label: 'Backing Image',
      content: 'Content of Tab Pane 2',
    }
  ]

  return (
    <Tabs className={styles.container} defaultActiveKey={tabs[0].key} type="card">
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

export default Backup
