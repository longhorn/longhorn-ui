import React from 'react'
import PropTypes from 'prop-types'
import { Table } from 'antd'
import { sortTable, sortTableByUTCDate } from '../../utils/sort'
import { pagination } from '../../utils/page'
import { formatMib } from '../../utils/formatter'
import { formatDate } from '../../utils/formatDate'
import { ModalBlur } from '../../components'
import { LinkTo } from '../../components'

const modal = ({
  visible,
  onOk,
  dataSource,
}) => {
  const modalOpts = {
    title: 'Volumes',
    visible,
    onOk,
    onCancel: onOk,
    hasOnCancel: true,
    width: 800,
  }
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => sortTable(a, b, 'name'),
      render: (text) => {
        return (
          <div>
            <LinkTo to={{ pathname: `/volume/${text}` }}>{text}</LinkTo>
          </div>
        )
      },
    },
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
      sorter: (a, b) => sortTable(a, b, 'size'),
      render: (text) => {
        return (
          <div>
           {formatMib(text)}
          </div>
        )
      },
    },
    {
      title: 'Created',
      dataIndex: 'created',
      key: 'created',
      sorter: (a, b) => sortTableByUTCDate(a, b, 'created'),
      render: (text) => {
        return (
          <div>
            {formatDate(text)}
          </div>
        )
      },
    },
  ]

  return (
    <ModalBlur {...modalOpts}>
      <div style={{ width: '100%', overflow: 'auto', maxHeight: 680 }}>
        <Table
          bordered={false}
          columns={columns}
          rowKey={record => record.id}
          dataSource={dataSource}
          pagination={pagination('volumePageSize')}
          simple
        />
      </div>
    </ModalBlur>
  )
}

modal.propTypes = {
  visible: PropTypes.bool,
  dataSource: PropTypes.array,
  onOk: PropTypes.func,
  onCancel: PropTypes.func,
}

export default modal
