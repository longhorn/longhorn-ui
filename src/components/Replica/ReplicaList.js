import classnames from 'classnames'
import React from 'react'
import PropTypes from 'prop-types'
import style from './Replica.less'
import { Spin } from 'antd'
import Replica from './Replica'

class ReplicaList extends React.Component {
  state = {
    start: false,
    end: true,
  }

  onScroll = (event) => {
    const { target } = event
    this.setState({
      start: target.scrollLeft !== 0,
      end: target.scrollWidth - target.clientWidth !== target.scrollLeft,
    })
  }

  render() {
    const { dataSource, loading, deleteReplicas, hosts, restoreStatus, rebuildStatus, purgeStatus } = this.props
    const { start, end } = this.state
    const replicas = dataSource.map(item => <Replica key={item.name} deleteReplicas={deleteReplicas} rebuildStatus={rebuildStatus} restoreStatus={restoreStatus} purgeStatus={purgeStatus} item={item} hosts={hosts} />)
    const cNames = classnames(style.replicaContainer, { [style.start]: start }, { [style.end]: end })
    return (
      <div onScroll={this.onScroll} className={cNames}>
        <div className={style.replica}>
          <Spin spinning={loading}>
            {replicas}
          </Spin>
        </div>
      </div>
    )
  }
}

ReplicaList.propTypes = {
  loading: PropTypes.bool,
  dataSource: PropTypes.array,
  deleteReplicas: PropTypes.func,
  hosts: PropTypes.array,
  restoreStatus: PropTypes.array,
  purgeStatus: PropTypes.array,
  rebuildStatus: PropTypes.array,
}

export default ReplicaList
