import React, { PropTypes } from 'react'
import { connect } from 'dva'
import BackupList from './BackupList'

function Backup({ backup, loading }) {
  const { data } = backup

  const backupListProps = {
    dataSource: data,
    loading,
  }

  return (
    <div className="content-inner">
      <BackupList {...backupListProps} />
    </div>
  )
}

Backup.propTypes = {
  backup: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
  loading: PropTypes.bool,
}

export default connect(({ backup, loading }) => ({ backup, loading: loading.models.backup }))(Backup)
