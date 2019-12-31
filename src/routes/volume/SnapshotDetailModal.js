import React from 'react'
import PropTypes from 'prop-types'
import { ModalBlur } from '../../components'
import RecurringList from './RecurringList'

const modal = ({
  visible,
  onCancel,
  onOk,
  selectedVolume,
  dispatch,
  loading,
}) => {
  const modalOpts = {
    title: 'Recurring Snapshot and Backup',
    visible,
    onCancel,
    onOk,
    hasOnCancel: true,
    width: 850,
    okText: 'Close',
  }

  const recurringListProps = {
    selectedVolume,
    dataSourceReplicas: selectedVolume.replicas || [],
    dataSource: selectedVolume.recurringJobs || [],
    loading,
    onOk(recurring) {
      dispatch({
        type: 'volume/recurringUpdate',
        payload: {
          recurring,
          url: selectedVolume.actions.recurringUpdate,
        },
      })
    },
  }

  return (
    <ModalBlur {...modalOpts}>
      <div style={{ width: '100%', overflow: 'auto', maxHeight: '500px' }}>
        <RecurringList {...recurringListProps} />
      </div>
    </ModalBlur>
  )
}

modal.propTypes = {
  visible: PropTypes.bool,
  loading: PropTypes.bool,
  selectedVolume: PropTypes.object,
  onOk: PropTypes.func,
  onCancel: PropTypes.func,
  dispatch: PropTypes.func,
}

export default modal
