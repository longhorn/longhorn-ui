import React from 'react'
import PropTypes from 'prop-types'
import { Table, Button, Icon, Tooltip } from 'antd'
import BackingImageActions from './BackingImageActions'
import { pagination } from '../../utils/page'
import { formatMib } from '../../utils/formater'

function list({ loading, dataSource, deleteBackingImage, cleanUpDiskMap, showDiskStateMapDetail, rowSelection, downloadBackingImage, height }) {
  const backingImageActionsProps = {
    deleteBackingImage,
    cleanUpDiskMap,
    downloadBackingImage,
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
      width: 200,
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
      width: 150,
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
  cleanUpDiskMap: PropTypes.func,
  rowSelection: PropTypes.object,
  height: PropTypes.number,
}

export default list
