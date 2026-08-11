import React from 'react'
import PropTypes from 'prop-types'
import { Table, Card, Icon, Tooltip } from 'antd'
import moment from 'moment'
import styles from './index.less'
import { formatDate } from '../../../utils/formatDate'
import { formatSnapshot, formatMib } from '../../../utils/formatter'
import { withTranslation } from 'react-i18next'

class SnapshotList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      dataSource: [],
      detailText: 'Expand',
      toggleSnapshotListVisible: false,
      iconType: 'plus-square',
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (prevState.toggleSnapshotListVisible) {
      let dataSource = nextProps.dataSource

      return {
        ...prevState,
        dataSource,
      }
    }
    return null
  }

  toggleSnapshotList = () => {
    this.setState({
      ...this.state,
      toggleSnapshotListVisible: !this.state.toggleSnapshotListVisible,
      detailText: !this.state.toggleSnapshotListVisible ? 'Collapse' : 'Expand',
      iconType: !this.state.toggleSnapshotListVisible ? 'minus-square' : 'plus-square',
    })
  }

  render() {
    const { t } = this.props
    let dataSource = []
    const columns = [
      {
        title: t('columns.type'),
        key: 'type',
        width: 120,
        render: (record) => {
          return (<div>{record.backupStatusObject ? t('snapshotList.type.backup') : t('snapshotList.type.snapshot')}</div>)
        },
      },
      {
        title: t('columns.name'),
        key: 'name',
        render: (record) => {
          return (<div>{record.name}</div>)
        },
      },
      {
        title: t('columns.size'),
        key: 'size',
        render: (record) => {
          return (<div>{record.backupStatusObject && record.backupStatusObject.size ? formatMib(record.backupStatusObject.size) : formatMib(record.size)}</div>)
        },
      },
      {
        title: t('columns.id'),
        key: 'id',
        render: (record) => {
          return (<div>{record.id}</div>)
        },
      },
      {
        title: t('columns.created'),
        key: 'created',
        render: (record) => {
          return (<div>{formatDate(record.created)}</div>)
        },
      },
      {
        title: t('columns.replicas'),
        key: 'Replicas',
        render: (record) => {
          if (record.backupStatusObject && record.backupStatusObject.replicas) {
            return (<div>{record.backupStatusObject.replicas}</div>)
          }
          return ''
        },
      },
      {
        title: t('columns.backups'),
        key: 'backupIds',
        render: (record) => {
          if (record.backupStatusObject && record.backupStatusObject.backupIds) {
            return (<div>{record.backupStatusObject.backupIds}</div>)
          }
          return ''
        },
      },
    ]

    if (this.state.toggleSnapshotListVisible) {
      dataSource = this.state.dataSource.map((item) => formatSnapshot(this.props.selectedVolume, item))
        .filter((item) => item.id !== 'volume-head')
        .sort((a, b) => moment(b.created).valueOf() - moment(a.created).valueOf())
    }

    const parentIdElement = (snapshot) => {
      return (<div style={{ textAlign: 'left' }}>{t('snapshotList.parentId')}: <span style={{ marginLeft: 10 }}>{snapshot.parent}</span></div>)
    }

    return (<Card bodyStyle={{ padding: 0 }}
      title={<div className={styles.header}>
      <div className="title" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Tooltip title={this.state.toggleSnapshotListVisible ? t('snapshotList.tooltip.collapse') : t('snapshotList.tooltip.expand')}>
          <div><Icon type={this.state.iconType} style={{ marginRight: 10 }} onClick={() => this.toggleSnapshotList()} />{t('snapshotList.title')}</div>
        </Tooltip>
      </div></div>}
      bordered={false}>{this.state.toggleSnapshotListVisible ? <div style={{ padding: 24 }}>
        <Table
          bordered={false}
          columns={columns}
          dataSource={dataSource}
          expandedRowRender={parentIdElement}
          rowKey={record => record.id}
        />
      </div> : <div></div>}</Card>
    )
  }
}

SnapshotList.propTypes = {
  t: PropTypes.func,
  dataSource: PropTypes.array,
  selectedVolume: PropTypes.object,
}

export default withTranslation()(SnapshotList)
