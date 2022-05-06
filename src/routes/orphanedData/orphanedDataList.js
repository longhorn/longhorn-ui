import React from 'react'
import PropTypes from 'prop-types'
import { Table } from 'antd'
import { pagination } from '../../utils/page'
import { sortTable } from '../../utils/sort'
import OrphanedDataActions from './orphanedDataActions'

function list({ loading, dataSource, height, rowSelection, deleteOrphanedData }) {
  const orphanedDataActionsProps = {
    deleteOrphanedData,
  }

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      width: 220,
      key: 'name',
      sorter: (a, b) => sortTable(a, b, 'name'),
      render: (text) => {
        return (
          <div>
            {text}
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
      title: 'Disk Name',
      dataIndex: 'parameters',
      width: 220,
      key: 'DiskName',
      sorter: (a, b) => {
        let valueA = a?.parameters.DiskName
        let valueB = b?.parameters.DiskName
        if (valueA < valueB) {
          return -1
        }
        if (valueA > valueB) {
          return 1
        }
        return 0
      },
      render: (obj) => {
        let diskName = obj.DiskName ? obj.DiskName : ''
        return (
          <div>
            {diskName}
          </div>
        )
      },
    },
    {
      title: 'Disk Path',
      dataIndex: 'parameters',
      width: 220,
      key: 'DiskPath',
      sorter: (a, b) => {
        let valueA = a?.parameters.DiskPath
        let valueB = b?.parameters.DiskPath
        if (valueA < valueB) {
          return -1
        }
        if (valueA > valueB) {
          return 1
        }
        return 0
      },
      render: (obj) => {
        let diskPath = obj.DiskPath ? obj.DiskPath : ''
        return (
          <div>
            {diskPath}
          </div>
        )
      },
    },
    {
      title: 'Directory Name',
      dataIndex: 'parameters',
      width: 180,
      key: 'DataName',
      sorter: (a, b) => {
        let valueA = a?.parameters.DataName
        let valueB = b?.parameters.DataName
        if (valueA < valueB) {
          return -1
        }
        if (valueA > valueB) {
          return 1
        }
        return 0
      },
      render: (obj) => {
        let directoryName = obj.DataName ? obj.DataName : ''
        return (
          <div>
            {directoryName}
          </div>
        )
      },
    },
    {
      title: 'Operation',
      key: 'operation',
      width: 110,
      fixed: 'right',
      render: (text, record) => {
        return (
          <OrphanedDataActions {...orphanedDataActionsProps} selected={record} />
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
    <div id="orphanedDataTable" style={{ flex: 1, height: '1px', overflow: 'hidden' }}>
      <Table
        className="common-table-class"
        bordered={false}
        columns={columns}
        dataSource={dataSource}
        rowSelection={rowSelection}
        rowKey={record => record.name}
        loading={loading}
        height={`${dataSource.length > 0 ? height : 1}px`}
        scroll={{ x: columnWidth, y: dataSource.length > 0 ? height : 1 }}
        pagination={pagination('orphanedDataSize')}
        simple
      />
    </div>
  )
}

list.propTypes = {
  loading: PropTypes.bool,
  dataSource: PropTypes.array,
  rowSelection: PropTypes.object,
  height: PropTypes.number,
  showRefCountVolumeModal: PropTypes.func,
  deleteOrphanedData: PropTypes.func,
}

export default list
