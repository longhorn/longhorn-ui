import React, { PropTypes } from 'react'
import { Table } from 'antd'
import './eventLogs.less'

function EventLogs({ data }) {
  const rowClassName = (record, index) => {
    if (index % 2 === 0) {
      return 'rowStriped'
    }
    return ''
  }
  const columns = [
    {
      title: 'Last Seen',
      dataIndex: 'lastTimestamp',
      className: 'date',
      render(text) {
        return (<div className="seenTime">{text}</div>)
      },
    }, {
      title: 'First Seen',
      dataIndex: 'firstTimestamp',
      className: 'date',
      render(text) {
        return (<div className="seenTime">{text}</div>)
      },
    }, {
      title: 'Count',
      dataIndex: 'count',
      className: 'text',
      render(text) {
        return (<div className="count">{text}</div>)
      },
    }, {
      title: 'Name',
      dataIndex: 'involvedObject.name',
      className: 'text',
    }, {
      title: 'Kind',
      dataIndex: 'involvedObject.kind',
      className: 'text',
      render(text) {
        return (<div className="kind">{text}</div>)
      },
    }, {
      title: 'Subobject',
      dataIndex: 'involvedObject.fieldPath',
      className: 'text',
    }, {
      title: 'Type',
      dataIndex: 'eventType',
      className: 'text',
      width: 70,
      render(text) {
        return (<div className="eventType">{text}</div>)
      },
    }, {
      title: 'Reason',
      dataIndex: 'reason',
      className: 'text',
    }, {
      title: 'Source',
      dataIndex: 'source.component',
      className: 'text',
    }, {
      title: 'Message',
      dataIndex: 'message',
      className: 'text',
    },
  ]
  return (
    <div className="eventLogs">
      <div className="title">Event Log</div>
      <div className="content">
       <Table columns={columns} rowClassName={rowClassName} rowKey={(record, key) => key} dataSource={data} />
       </div>
     </div>
  )
}

EventLogs.propTypes = {
  data: PropTypes.array,
}

export default EventLogs
