import React from 'react'
import PropTypes from 'prop-types'
import { Table, Button } from 'antd'
import BackingImageActions from './BackingImageActions'
import { formatMib } from '../../utils/formater'

function list({ loading, dataSource, deleteBackingImage, showDiskStateMapDetail }) {
  const backingImageActionsProps = {
    deleteBackingImage,
  }

  const columns = [
    {
      title: 'State',
      dataIndex: 'state',
      key: 'state',
      width: 100,
      render: (text, record) => {
        if (record && record.deletionTimestamp) {
          return (<div className="degraded capitalize">deleting</div>)
        } else {
          return (<div className="healthy capitalize">Healthy</div>)
        }
      },
    }, {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 100,
      render: (text) => {
        return (
          <div>
            {text}
          </div>
        )
      },
    }, {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
      width: 100,
      render: (text) => {
        return (
          <div>
            {formatMib(text)}
          </div>
        )
      },
    }, {
      title: 'Image URL',
      dataIndex: 'imageURL',
      key: 'imageURL',
      width: 400,
      render: (text) => {
        return (
          <div>
            {text}
          </div>
        )
      },
    }, {
      title: 'Backing Image state in disks',
      dataIndex: 'diskStateMap',
      key: 'diskStateMap',
      width: 300,
      render: (text, record) => {
        return (
          <div onClick={() => { showDiskStateMapDetail(record) }} style={{ width: '100%', cursor: 'pointer' }}>
            <Button type="link" block>Detail</Button>
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

  const pagination = false

  return (
    <div>
      <Table
        className="common-table-class"
        bordered={false}
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        simple
        pagination={pagination}
        rowKey={record => record.id}
      />
    </div>
  )
}

list.propTypes = {
  loading: PropTypes.bool,
  dataSource: PropTypes.array,
  deleteBackingImage: PropTypes.func,
  showDiskStateMapDetail: PropTypes.func,
}

export default list
