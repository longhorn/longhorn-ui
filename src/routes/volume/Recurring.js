import React, { PropTypes } from 'react'
import { Form } from 'antd'
import RecurringList from './RecurringList'
import { ModalBlur } from '../../components'

const modal = ({
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
    dataSource: [{
      id: '1',
      type: 'Snapshot',
      schedule: 'Hourly',
      time: '00:00 Every Hour',
      created: '4:10PM 3/14/17',
    }, {
      id: '2',
      type: 'Backup',
      schedule: 'Daily',
      time: '12:00:00AM',
      created: '4:10PM 3/14/17',
    }, {
      id: '3',
      type: 'Backup',
      schedule: 'Weekly',
      time: 'Sunday 12:00:00AM',
      created: '4:10PM 3/14/17',
    },
    ],
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
