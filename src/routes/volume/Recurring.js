import React, { PropTypes } from 'react'
import { Form } from 'antd'
import RecurringList from './RecurringList'
import { ModalBlur } from '../../components'

const modal = ({
  item,
  visible,
  onCancel,
}) => {
  const modalOpts = {
    title: 'Recurring Backup',
    width: 800,
    visible,
    onCancel,
  }
  const recurringListProps = {
    dataSource: item.recurringJobs || [],
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
