import React from 'react'
import PropTypes from 'prop-types'
import { Table } from 'antd'
import { pagination } from '../../utils/page'
import { sortTable } from '../../utils/sort'
import OrphanedDataActions from './OrphanedDataActions'

function InstanceOrphansList({ loading, dataSource, height, rowSelection, deleteOrphanedData }) {
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
      render: (text) => text,
    },
    {
      title: 'Node',
      dataIndex: 'nodeID',
      width: 150,
      key: 'nodeID',
      sorter: (a, b) => sortTable(a, b, 'nodeID'),
      render: (text) => text,
    },
    {
      title: 'Instance Name',
      dataIndex: 'parameters',
      width: 220,
      key: 'instanceName',
      sorter: (a, b) => sortTable(a, b, 'parameters.InstanceName'),
      render: (obj) => obj?.InstanceName || '',
    },
    {
      title: 'Instance Manager',
      dataIndex: 'parameters',
      width: 220,
      key: 'instanceManager',
      sorter: (a, b) => sortTable(a, b, 'parameters.InstanceManager'),
      render: (obj) => obj?.InstanceManager || '',
    },
    {
      title: 'Instance Type',
      dataIndex: 'orphanType',
      width: 220,
      key: 'orphanType',
      sorter: (a, b) => sortTable(a, b, 'orphanType'),
      render: (text) => text,
    },
    {
      title: 'Data Engine',
      dataIndex: 'dataEngine',
      width: 180,
      key: 'dataEngine',
      sorter: (a, b) => sortTable(a, b, 'dataEngine'),
      render: (text) => text || '-',
    },
    {
      title: 'Operation',
      key: 'operation',
      width: 110,
      fixed: 'right',
      render: (text, record) => (
        <OrphanedDataActions {...orphanedDataActionsProps} selected={record} />
      ),
    },
  ]

  // dynamic column width
  let columnWidth = 0

  columns.forEach((ele) => {
    columnWidth += ele.width
  })

  return (
    <div id="instanceOrphansTable">
      <Table
        bordered={false}
        columns={columns}
        dataSource={dataSource}
        rowSelection={rowSelection}
        rowKey={record => record.name}
        loading={loading}
        scroll={{ x: columnWidth, y: dataSource.length > 0 ? height : 1 }}
        pagination={pagination('orphanedDataSize')}
        simple
      />
    </div>
  )
}

InstanceOrphansList.propTypes = {
  loading: PropTypes.bool,
  dataSource: PropTypes.array,
  rowSelection: PropTypes.object,
  height: PropTypes.number,
  showRefCountVolumeModal: PropTypes.func,
  deleteOrphanedData: PropTypes.func,
}

export default InstanceOrphansList
