import React, { PropTypes } from 'react'
import classnames from 'classnames'
import { ModalBlur } from '../../components'
import style from './Salvage.less'
import moment from 'moment'

const getReplicaShortName = (name) => {
  const ary = name.split('-')
  const len = ary.length
  return ary.slice(len - 3, len).join('-')
}

const Replica = ({ item, toggleSelect, selected }) => {
  const cNames = classnames(style.replica, { [style.selected]: selected })
  const failedAt = item.badTimestamp ? moment(new Date(item.badTimestamp).getTime()).fromNow() : 'N/A'

  return (
    <div onClick={() => toggleSelect(item.name)} className={cNames}>
      <div style={{ backgroundColor: item.running ? '#108eb9' : 'lightgrey', padding: 20 }}>
        <img
          alt="replica"
          style={{ display: 'inline' }}
          width="50px"
          src={item.running ? '/disk-healthy.png' : '/disk-unhealthy.png'}
          />
        <span style={{ marginLeft: 20, verticalAlign: '100%', fontSize: 15, color: 'white' }}>
          {getReplicaShortName(item.name)}
        </span>
      </div>
      <div style={{ textAlign: 'center', marginTop: 15 }}>
        <h3>{item.host || 'N/A'}</h3>
        <p style={{ color: 'gray' }}>Host</p>
      </div>
      <div style={{ textAlign: 'center', marginTop: 10 }} className="faulted">
        Failed At: {failedAt}
      </div>
    </div>
  )
}

Replica.propTypes = {
  item: PropTypes.object.isRequired,
  toggleSelect: PropTypes.func.isRequired,
  selected: PropTypes.bool.isRequired,
}

class Salvage extends React.Component {

  state = {
    selectedReplicaMap: {},
    showErrorMessage: false,
  }

  toggleSelect = name => {
    const map = this.state.selectedReplicaMap
    this.setState({
      ...this.state,
      selectedReplicaMap: { ...map, [name]: !map[name] },
    })
  }

  get selectedReplicaNames() {
    const map = this.state.selectedReplicaMap
    return Object.keys(map)
      .filter(k => map[k])
  }

  timer = null
  clearErrorMessage = () => {
    if (this.timer) {
      clearTimeout(this.timer)
    }

    this.timer = setTimeout(() => {
      this.setState({
        showErrorMessage: false,
      })
    }, 4000)
  }

  render() {
    const {
      item,
      visible,
      onCancel,
      onOk,
    } = this.props

    const handleOk = () => {
      if (this.selectedReplicaNames.length > 0) {
        onOk(this.selectedReplicaNames, item.actions.salvage)
        return true
      }
      this.setState({
        showErrorMessage: true,
      })
      this.clearErrorMessage()
      return false
    }

    const modalOpts = {
      title: 'Select one or more replicas to salvage',
      visible,
      onCancel,
      width: 1040,
      onOk: handleOk,
    }

    if (!item) {
      return null
    }

    const replicas = item.replicas.map(r => (
      <Replica
        selected={!!this.state.selectedReplicaMap[r.name]}
        toggleSelect={this.toggleSelect}
        key={r.name}
        item={r}
      />
    ))

    return (
      <ModalBlur {...modalOpts}>
        <div className={style.replicaList}>
          {replicas}
        </div>
        <div style={{ textAlign: 'right' }}>
          <p>
            <span className="healthy"> {this.selectedReplicaNames.length} </span>
             replicas selected
          </p>
          {
            this.state.showErrorMessage &&
            this.selectedReplicaNames.length === 0 ?
            <p className="faulted">Plase select at least one replica.</p>
            : null
          }
        </div>
      </ModalBlur>
    )
  }
}

Salvage.propTypes = {
  visible: PropTypes.bool,
  onCancel: PropTypes.func,
  item: PropTypes.object,
  onOk: PropTypes.func,
}

export default Salvage
