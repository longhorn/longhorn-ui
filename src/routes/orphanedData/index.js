import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { Tabs } from 'antd'
import { connect } from 'dva'
import { routerRedux } from 'dva/router'
import ReplicaDataOrphans from './ReplicaDataOrphans'
import InstanceOrphans from './InstanceOrphans'
import styles from './index.less'
import { ORPHAN_TYPES } from '../../utils/orphanedData'

function OrphanedData({ dispatch, location }) {
  const { pathname, hash, search } = location

  const tabs = [
    {
      key: ORPHAN_TYPES.REPLICA_DATA,
      label: 'Replica Data',
      content: <ReplicaDataOrphans location={location} />,
    },
    {
      key: 'instance',
      label: 'Instances',
      content: <InstanceOrphans location={location} />,
    },
  ]

  const defaultKey = tabs[0].key
  const tabKeys = tabs.map(tab => tab.key)
  const currentHash = hash?.replace('#', '')
  const activeTab = tabKeys.includes(currentHash) ? currentHash : defaultKey

  useEffect(() => {
    if (!currentHash || !tabKeys.includes(currentHash)) {
      dispatch(routerRedux.replace({ pathname, hash: defaultKey, search }))
    }
  }, [currentHash, tabKeys, pathname, search, dispatch])

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

OrphanedData.propTypes = {
  location: PropTypes.object,
  dispatch: PropTypes.func,
  setting: PropTypes.object,
}

export default connect()(OrphanedData)
