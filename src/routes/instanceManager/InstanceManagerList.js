import React from 'react'
import PropTypes from 'prop-types'
import { Table, Button } from 'antd'
import { pagination } from '../../utils/page'
import { sortTable } from '../../utils/sort'
function list({ loading, dataSource, height, showRefCountVolumeModal }) {
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      width: 220,
      key: 'name',
      sorter: (a, b) => sortTable(a, b, 'name'),
      render: (text, record) => {
        return (
          <div>
            <Button type="link" onClick={() => showRefCountVolumeModal(record.volume)}>
              {text}
            </Button>
          </div>
        )
      },
    },
    {
      title: 'State',
      dataIndex: 'currentState',
      width: 150,
      key: 'currentState',
      sorter: (a, b) => sortTable(a, b, 'currentState'),
      render: (text) => {
        return (
          <div className={text === 'running' ? 'healthy' : 'color-warning'}>
            {text && text.firstUpperCase()}
          </div>
        )
      },
    },
    {
      title: 'Type',
      dataIndex: 'managerType',
      width: 150,
      key: 'managerType',
      sorter: (a, b) => sortTable(a, b, 'managerType'),
      render: (text) => {
        return (
          <div>
            {text}
          </div>
        )
      },
    },
    {
      title: 'Ref Count Volume',
      dataIndex: 'volume',
      width: 220,
      key: 'volume',
      sorter: (a, b) => {
        if (a.volume && b.volume) {
          if (a.volume.length > b.volume.length) {
            return 1
          }
          return -1
        }
        return 0
      },
      render: (text, record) => {
        return (
          <div>
            {record.volume && record.volume.length}
          </div>
        )
      },
    },
    {
      title: 'Node',
      dataIndex: 'nodeID',
      width: 150,
      key: 'nodeID',
      sorter: (a, b) => sortTable(a, b, 'nodeID'),
      render: (text) => {
        return (
          <div>
            {text}
          </div>
        )
      },
    },
    {
      title: 'Instance Manager Image',
      dataIndex: 'image',
      width: 280,
      key: 'image',
      sorter: (a, b) => sortTable(a, b, 'image'),
      render: (text) => {
        return (
          <div>
            {text}
          </div>
        )
      },
    },
  ]

  // dynamic column width
  let columnWidth = 0

  columns.forEach((ele) => {
    columnWidth += ele.width
  })

  return (
    <div id="instanceManagerTable" style={{ flex: 1, height: '1px', overflow: 'hidden' }}>
      <Table
        className="common-table-class"
        bordered={false}
        columns={columns}
        dataSource={dataSource}
        rowKey={record => record.name}
        loading={loading}
        height={`${height}px`}
        scroll={{ x: columnWidth, y: height }}
        pagination={pagination('instanceManagerSize')}
        simple
      />
    </div>
  )
}

list.propTypes = {
  loading: PropTypes.bool,
  dataSource: PropTypes.array,
  height: PropTypes.number,
  showRefCountVolumeModal: PropTypes.func,
}

export default list
