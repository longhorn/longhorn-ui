import React, { PropTypes } from 'react'
import { Form } from 'antd'
import RecurringList from './RecurringList'
import { ModalBlur } from '../../components'

const modal = ({
  item,
  visible,
  onCancel,
  onOk,
}) => {
  const recurringListProps = {
    dataSource: item.recurringJobs ? item.recurringJobs.slice(0) : [],
  }
  const modalOpts = {
    title: 'Recurring Snapshot and Backup',
    width: 800,
    visible,
    onCancel,
    onOk: () => {
      onOk(recurringListProps.dataSource, item.actions.recurringUpdate)
    },
  }
  return (
    <ModalBlur {...modalOpts}>
      <RecurringList {...recurringListProps} />
    </ModalBlur>
  )
}

modal.propTypes = {
  form: PropTypes.object.isRequired,
  visible: PropTypes.bool,
  onCancel: PropTypes.func,
  item: PropTypes.object,
  onOk: PropTypes.func,
}

export default Form.create()(modal)
