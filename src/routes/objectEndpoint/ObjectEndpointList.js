import React from 'react'
import PropTypes from 'prop-types'
import { Table, Tooltip } from 'antd'
import { pagination } from '../../utils/page'
import ObjectEndpointActions from './ObjectEndpointActions'

function list({
  dataSource,
  height,
  loading,
  rowSelection,
  editObjectEndpoint,
  deleteObjectEndpoint,
}) {
  const objectEndpointActionsProps = {
    editObjectEndpoint,
    deleteObjectEndpoint,
  }

  const endpointStateColorMap = {
    Unknown: { color: '#F15354', bg: 'rgba(241,83,84,.05)' },
    Starting: { color: '#F1C40F', bg: 'rgba(241,196,15,.05)' },
    Running: { color: '#27AE5F', bg: 'rgba(39,174,95,.05)' },
    Stopping: { color: '#DEE1E3', bg: 'rgba(222,225,227,.05)' },
    Error: { color: '#F15354', bg: 'rgba(241,83,84,.1)' },
  }

  const columns = [
    {
      title: 'State',
      dataIndex: 'state',
      key: 'state',
      width: 160,
      render: (text, record) => {
        const tooltip = `Endpoint ${record.name} is ${record.state}`
        const colormap = endpointStateColorMap[record.state] || { color: '', bg: '' }
        return (
          <Tooltip title={tooltip}>
            <div style={{ display: 'inline-block', padding: '0 4px', color: colormap.color, border: `1px solid ${colormap.color}`, backgroundColor: colormap.bg }}>
              {record.state}
            </div>
          </Tooltip>
        )
      },
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => {
        return (
          <div>{record.name}</div>
        )
      },
    },
    {
      title: 'Endpoint',
      dataIndex: 'endpoint',
      key: 'endpoint',
      render: (text, record) => {
        return (
          <div>{record.endpoint}</div>
        )
      },
    },
    {
      title: 'Operation',
      key: 'operation',
      width: 120,
      render: (text, record) => {
        return (
          <ObjectEndpointActions {...objectEndpointActionsProps} selected={record} />
        )
      },
    },
  ]

  return (
    <div id="objectEndpointTable">
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
  dataSource: PropTypes.array,
  heigth: PropTypes.number,
  loading: PropTypes.bool,
  rowSelection: PropTypes.object,
  editObjectEndpoint: PropTypes.func,
  deleteObjectEndpoint: PropTypes.func,
}

export default list
