import React from 'react'
import PropTypes from 'prop-types'
import { Table, Button, Icon, Tooltip, Tag } from 'antd'
import BackingImageActions from './BackingImageActions'
import { pagination } from '../../utils/page'
import { formatMib } from '../../utils/formatter'
import { nodeTagColor, diskTagColor } from '../../utils/constants'

function list({ loading, dataSource, deleteBackingImage, showDiskStateMapDetail, rowSelection, downloadBackingImage, showUpdateMinCopiesCount, height }) {
  const backingImageActionsProps = {
    deleteBackingImage,
    downloadBackingImage,
    showUpdateMinCopiesCount,
  }
  const state = (record) => {
    if (record.deletionTimestamp) {
      // Deleting
      return (<Tooltip title={'Deleting'}><Icon type="sync" style={{ marginLeft: 10, color: '#f5222d' }} spin /></Tooltip>)
    }
    if (record.diskStateMap && Object.keys(record.diskStateMap).every((key) => record.diskStateMap[key] === 'failed')) {
      return (<Tooltip title={'The backingImage is unavailable'}><Icon type="warning" style={{ marginLeft: 10, color: '#f5222d' }} /></Tooltip>)
    }
    return ''
  }

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text, record) => {
        return (
          <div onClick={() => { showDiskStateMapDetail(record) }} style={{ width: '100%', cursor: 'pointer' }}>
            <Button type="link" block>{text}{state(record)}</Button>
          </div>
        )
      },
    }, {
      title: 'UUID',
      dataIndex: 'uuid',
      key: 'uuid',
      width: 120,
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
      width: 80,
      sorter: (a, b) => a.size - b.size,
      render: (text) => {
        return (
          <div>
            {formatMib(text)}
          </div>
        )
      },
    },
    {
      title: 'Created From',
      dataIndex: 'sourceType',
      key: 'sourceType',
      width: 150,
      sorter: (a, b) => a.sourceType.localeCompare(b.sourceType),
      render: (text) => {
        return (
          <div>
            {text}
          </div>
        )
      },
    }, {
      title: 'Minimum Copies',
      dataIndex: 'minNumberOfCopies',
      key: 'minNumberOfCopies',
      width: 120,
      sorter: (a, b) => a.minNumberOfCopies.toString().localeCompare(b.minNumberOfCopies.toString()),
      render: (text) => {
        return (
          <div>
            {text}
          </div>
        )
      },
    }, {
      title: 'Node Tags',
      key: 'nodeSelector',
      dataIndex: 'nodeSelector',
      width: 120,
      render: (_text, record) => {
        const nodeTags = record.nodeSelector?.map((tag, index) => {
          return (
              <span style={{ marginBottom: '6px' }} key={index}>
                <Tag color={nodeTagColor}>
                  {tag}
                </Tag>
              </span>
          )
        }) || ''
        return (
          <div style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column', alignItems: 'center' }}>
            {nodeTags}
          </div>
        )
      },
    },
    {
      title: 'Disk Tags',
      key: 'diskSelector',
      dataIndex: 'diskSelector',
      width: 120,
      render: (_text, record) => {
        const diskTags = record.diskSelector?.sort().map((tag, index) => {
          return (
              <span style={{ marginBottom: '6px' }} key={index}>
                <Tag color={diskTagColor}>
                  {tag}
                </Tag>
              </span>
          )
        }) || ''
        return (
          <div style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column', alignItems: 'center' }}>
            {diskTags}
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
  showUpdateMinCopiesCount: PropTypes.func,
  rowSelection: PropTypes.object,
  height: PropTypes.number,
}

export default list
