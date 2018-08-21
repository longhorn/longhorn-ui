import classnames from 'classnames'
import React, { PropTypes } from 'react'
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
    const { dataSource, loading, deleteReplica, hosts } = this.props
    const { start, end } = this.state
    const replicas = dataSource.map(item => <Replica key={item.name} deleteReplica={deleteReplica} item={item} hosts={hosts} />)
    const cNames = classnames(style.replicaContainer, { [style.start]: start }, { [style.end]: end })
    return (
      <div onScroll={this.onScroll} className={cNames}>
        <div className={style.replica}>
          <Spin spinning={loading}>
            {replicas}
          </Spin>
        </div>
      </div >
    )
  }
}

ReplicaList.propTypes = {
  loading: PropTypes.bool,
  dataSource: PropTypes.array,
  deleteReplica: PropTypes.func,
  hosts: PropTypes.array,
}

export default ReplicaList
