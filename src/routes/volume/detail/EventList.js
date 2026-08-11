import React from 'react'
import PropTypes from 'prop-types'
import { Table, Card, Icon, Tooltip } from 'antd'
import { formatDate } from '../../../utils/formatDate'
import styles from './index.less'
import { withTranslation } from 'react-i18next'

class EventList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      dataSource: this.props.dataSource.map(item => ({ ...item })),
      detailText: 'Expand',
      toggleEventLogVisible: false,
      iconType: 'plus-square',
    }
  }

  toggleEventLog = () => {
    this.setState({
      ...this.state,
      toggleEventLogVisible: !this.state.toggleEventLogVisible,
      detailText: !this.state.toggleEventLogVisible ? 'Collapse' : 'Expand',
      iconType: !this.state.toggleEventLogVisible ? 'minus-square' : 'plus-square',
    })
    if (!this.state.toggleEventLogVisible) {
      this.props.dispatch({
        type: 'eventlog/startWS',
        payload: {
          dispatch: this.props.dispatch,
          type: 'events',
          ns: 'eventlog',
        },
      })
    } else {
      this.props.dispatch({
        type: 'eventlog/stopWS',
      })
    }
  }

  render() {
    const { t } = this.props
    const columns = [
      {
        title: t('columns.name'),
        key: 'name',
        render: (record) => {
          return (<div style={{ minWidth: 120 }}>{record.name}</div>)
        },
      }, {
        title: t('columns.kind'),
        key: 'kind',
        render: (record) => {
          return (<div>{record.kind}</div>)
        },
      },
      {
        title: t('columns.source'),
        key: 'source',
        render: (record) => {
          return (<div>{record.source}</div>)
        },
      },
      {
        title: t('columns.type'),
        key: 'type',
        render: (record) => {
          return (<div>{record.type}</div>)
        },
      },
      {
        title: t('columns.firstTime'),
        key: 'firstTimestamp',
        render: (record) => {
          return (<div>{formatDate(record.firstTimestamp)}</div>)
        },
      },
      {
        title: t('columns.lastTime'),
        key: 'lastTimestamp',
        render: (record) => {
          return (<div>{formatDate(record.lastTimestamp)}</div>)
        },
      },
      {
        title: t('columns.reason'),
        key: 'reason',
        render: (record) => {
          return (<div>{record.reason}</div>)
        },
      },
      {
        title: t('columns.message'),
        key: 'message',
        width: 400,
        render: (record) => {
          return (<div>{record.message}</div>)
        },
      },
    ]
    return (<Card bodyStyle={{ padding: 0 }}
      title={<div className={styles.header}>
      <div className="title" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Tooltip title={this.state.toggleEventLogVisible ? t('eventList.tooltip.collapse') : t('eventList.tooltip.expand')}>
          <div><Icon type={this.state.iconType} style={{ marginRight: 10 }} onClick={() => this.toggleEventLog()} /> {t('eventList.title')}</div>
        </Tooltip>
      </div></div>}
      bordered={false}>{this.state.toggleEventLogVisible ? <div style={{ padding: 24 }}>
        <Table
          bordered={false}
          columns={columns}
          dataSource={this.props.dataSource}
          rowKey={record => record.id}
        />
      </div> : <div></div>}</Card>
    )
  }
}

EventList.propTypes = {
  t: PropTypes.func,
  dataSource: PropTypes.array,
  dispatch: PropTypes.func,
}

export default withTranslation()(EventList)
