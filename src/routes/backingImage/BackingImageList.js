import React from 'react'
import PropTypes from 'prop-types'
import { Table, Button, Icon, Tooltip } from 'antd'
import BackingImageActions from './BackingImageActions'
import { pagination } from '../../utils/page'
import { formatMib } from '../../utils/formatter'

function list({ loading, dataSource, deleteBackingImage, showDiskStateMapDetail, rowSelection, downloadBackingImage, height }) {
  const backingImageActionsProps = {
    deleteBackingImage,
    downloadBackingImage,
  }

  const dynamicStateIcon = (record) => {
    if (record.deletionTimestamp) {
      // Deleting
      return (
        <Tooltip title="Deleting backing image">
          <Icon type="delete" className="color-error" />
        </Tooltip>
      )
    }
    if (Object.values(record.diskFileStatusMap).length > 0
    && Object.values(record.diskFileStatusMap).some((diskStatus) => ['starting', 'pending', 'in-progress', 'ready-for-transfer'].includes(diskStatus.state))) {
      // some creating states
      const state = Object.values(record.diskFileStatusMap)[0]?.state || ''
      const percentage = Object.values(record.diskFileStatusMap)[0]?.progress?.toString() || ''
      return (
        <Tooltip title={state}>
          <Icon type="sync" style={{ color: '#00558b', marginRight: 4 }} spin />
          {percentage && <span style={{ color: '#00558b' }}>{`${percentage} %`}</span>}
        </Tooltip>
      )
    }

    return ''
  }

  const staticStateIcon = (record) => {
    if (record.secret !== '' || record.secretNamespace !== '') {
      // encrypted backing image
      return (
        <Tooltip title="Encrypted Backing Image">
          <Icon className="color-warning" type="lock" />
        </Tooltip>
      )
    }

    if (record.diskFileStatusMap && Object.values(record.diskFileStatusMap).every((diskStatus) => diskStatus.state.includes('failed'))) {
      // unavailable backing image
      return (<Tooltip title={'The backingImage is unavailable'}><Icon type="warning" style={{ marginLeft: 10, color: '#f5222d' }} /></Tooltip>)
    }

    return ''
  }

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text, record) => {
        return (
          <div onClick={() => { showDiskStateMapDetail(record) }} style={{ width: '100%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {staticStateIcon(record)}
            <Button type="link" style={{ width: 'fit-content', paddingLeft: 8, paddingRight: 8 }} block>{text}</Button>
            {dynamicStateIcon(record)}
          </div>
        )
      },
    }, {
      title: 'UUID',
      dataIndex: 'uuid',
      key: 'uuid',
      width: 150,
      sorter: (a, b) => a.uuid.localeCompare(b.uuid),
      render: (text) => {
        return (
          <div>{text}</div>
        )
      },
    }, {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
      width: 150,
      sorter: (a, b) => a.size - b.size,
      render: (text) => {
        return (
          <div>
            {formatMib(text)}
          </div>
        )
      },
    }, {
      title: 'Created From',
      dataIndex: 'sourceType',
      key: 'sourceType',
      width: 200,
      sorter: (a, b) => a.sourceType.localeCompare(b.sourceType),
      render: (text) => {
        return (
          <div>
            {text}
          </div>
        )
      },
    }, {
      title: 'Operation',
      key: 'operation',
      width: 120,
      render: (text, record) => {
        return (
          <BackingImageActions {...backingImageActionsProps} selected={record} />
        )
      },
    },
  ]

  return (
    <div id="backingImageTable" style={{ flex: 1, height: '1px', overflow: 'hidden' }}>
      <Table
        className="common-table-class"
        bordered={false}
        columns={columns}
        rowSelection={rowSelection}
        dataSource={dataSource}
        loading={loading}
        simple
        pagination={pagination}
        rowKey={record => record.id}
        scroll={{ x: 970, y: dataSource.length > 0 ? height : 1 }}
      />
    </div>
  )
}

list.propTypes = {
  loading: PropTypes.bool,
  dataSource: PropTypes.array,
  deleteBackingImage: PropTypes.func,
  showDiskStateMapDetail: PropTypes.func,
  rowSelection: PropTypes.object,
  height: PropTypes.number,
}

export default list
