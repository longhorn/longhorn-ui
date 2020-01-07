import React from 'react'
import PropTypes from 'prop-types'
import { ModalBlur } from '../../components'
import RecurringList from './RecurringBulkList'

const modal = ({
  visible,
  onCancel,
  onOk,
  selectedRows,
  dispatch,
  loading,
}) => {
  const modalOpts = {
    title: 'Bulk Update Recurring Snapshot and Backup',
    visible,
    onCancel,
    onOk,
    hasOnCancel: true,
    width: 850,
    okText: 'Close',
    footer: null,
    bodyStyle: { padding: '0px' },
  }

  const recurringListProps = {
    selectedRows,
    dataSourceReplicas: [],
    dataSource: [],
    loading,
    onOk(recurring) {
      dispatch({
        type: 'volume/bulkRecurringUpdate',
        payload: {
          recurringList: recurring,
          selectedRows,
        },
      })
    },
    onModalCancel() {
      dispatch({ type: 'volume/hideSnapshotBulkModal' })
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
  selectedRows: PropTypes.array,
  onOk: PropTypes.func,
  onCancel: PropTypes.func,
  dispatch: PropTypes.func,
}

export default modal
