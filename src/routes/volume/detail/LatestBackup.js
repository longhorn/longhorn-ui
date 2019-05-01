import React from 'react'
import PropTypes from 'prop-types'
import { Progress } from 'antd'
import moment from 'moment'

class LatestBackup extends React.Component {
  state = {
    progress: 0,
  }

  UNSAFE_componentWillMount() {
    const { queryBackupStatus, backupStatus } = this.props

    this.state.updateProgress = setInterval(() => {
      const { progress } = this.state
      if (progress < 60 && backupStatus.inProgress) {
        this.setState({
          progress: progress + 1,
        })
      }
      if (!backupStatus.inProgress) {
        this.setState({
          progress: 0,
        })
      }
    }, 500)

    this.state.updateBackupStatus = setInterval(() => {
      queryBackupStatus()
    }, 10000)
    queryBackupStatus()
  }

  componentWillUnmount() {
    const { updateProgress, updateBackupStatus } = this.state
    const { clearBackupStatus } = this.props
    clearInterval(updateProgress)
    clearInterval(updateBackupStatus)
    clearBackupStatus()
  }

  render() {
    let { backupStatus } = this.props
    const { progress } = this.state
    return (
      <div>
        {backupStatus.actions && !backupStatus.started && <div style={{ color: 'rgba(0,0,0,.43)' }}>no backup yet</div>}
        {backupStatus.started && <Progress percent={backupStatus.inProgress ? progress : 100} status={backupStatus.inProgress ? 'active' : 'success'} />}
        {backupStatus.started && <div style={{ color: 'rgba(0,0,0,.43)' }}>{moment(backupStatus.started).calendar()}</div>}
      </div>)
  }
}


LatestBackup.propTypes = {
  backupStatus: PropTypes.object,
  queryBackupStatus: PropTypes.func,
  clearBackupStatus: PropTypes.func,
}

export default LatestBackup
