import React from 'react'
import PropTypes from 'prop-types'
import { ModalBlur } from '../../components'
import RecurringJob from './detail/RecurringJob'

const modal = ({
  visible,
  onCancel,
  onOk,
  selectedVolume,
  volumeRecurringJobs,
  recurringJobData,
  dispatch,
  loading,
}) => {
  const modalOpts = {
    title: '',
    visible,
    onCancel,
    onOk,
    hasOnCancel: true,
    width: 1000,
    okText: 'Close',
    bodyStyle: { padding: '0px' },
    style: { top: 0 },
  }

  const recurringJobProps = {
    dataSource: volumeRecurringJobs,
    recurringJobData,
    selectedVolume,
    loading,
    dispatch,
  }


  return (
    <ModalBlur {...modalOpts}>
      <div style={{ width: '100%', overflow: 'auto' }}>
        <RecurringJob {...recurringJobProps} />
      </div>
    </ModalBlur>
  )
}

modal.propTypes = {
  visible: PropTypes.bool,
  loading: PropTypes.bool,
  selectedVolume: PropTypes.object,
  volumeRecurringJobs: PropTypes.array,
  recurringJobData: PropTypes.array,
  onOk: PropTypes.func,
  onCancel: PropTypes.func,
  dispatch: PropTypes.func,
}

export default modal
