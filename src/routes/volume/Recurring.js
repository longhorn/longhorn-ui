import React, { PropTypes } from 'react'
import RecurringList from './RecurringList'
import { ModalBlur } from '../../components'


class Modal extends React.Component {
  render() {
    const { item, visible, onCancel, onOk } = this.props
    const recurringListProps = {
      dataSource: item.recurringJobs || [],
    }
    const modalOpts = {
      title: `Recurring Snapshot and Backup - ${item.id}`,
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
}

Modal.propTypes = {
  visible: PropTypes.bool,
  onCancel: PropTypes.func,
  item: PropTypes.object,
  onOk: PropTypes.func,
  children: PropTypes.object,
}

export default Modal
