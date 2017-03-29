import React, { PropTypes } from 'react'
import { Table } from 'antd'
import classnames from 'classnames'
import styles from './eventLogs.less'

function EventLogs({ data }) {
  const columns = [
    {
      title: 'date',
      dataIndex: 'date',
      className: styles.date,
    }, {
      title: 'text',
      dataIndex: 'text',
      className: styles.text,
      render: (text, record) => <span className={classnames({ [styles.info]: record.type === 'info', [styles.error]: record.type === 'error' })}>{text}</span>,
    },
  ]
  return <Table pagination={false} showHeader={false} columns={columns} rowKey={(record, key) => key} dataSource={data} />
}

EventLogs.propTypes = {
  data: PropTypes.array,
}

export default EventLogs
