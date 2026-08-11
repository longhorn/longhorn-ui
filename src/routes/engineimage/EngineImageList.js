import React from 'react'
import PropTypes from 'prop-types'
import { Table, Icon } from 'antd'
import classnames from 'classnames'
import { formatDate } from '../../utils/formatDate'
import EngineImageActions from './EngineImageActions'
import { LinkTo } from '../../components'
import { withTranslation } from 'react-i18next'

function list({ loading, dataSource, deleteEngineImage, t }) {
  const engineImageActionsProps = {
    deleteEngineImage,
  }

  const columns = [
    {
      title: t('columns.image'),
      dataIndex: 'image',
      key: 'image',
      width: 300,
      render: (text, record) => {
        return (
          <div>
            <LinkTo to={{ pathname: `/engineimage/${record.id}` }}>
              {text}
            </LinkTo>
          </div>
        )
      },
    }, {
      title: t('columns.status'),
      dataIndex: 'state',
      key: 'state',
      width: 100,
      render: (text, record) => {
        return (
          <div className={classnames({ [record.incompatible ? 'incompatible' : text.toLowerCase()]: true, capitalize: true })}>
            {record.incompatible ? t('engineImageList.status.incompatible') : text.hyphenToHump()}
          </div>
        )
      },
    }, {
      title: t('columns.default'),
      dataIndex: 'default',
      key: 'default',
      width: 200,
      render: _default => {
        return (
          _default ? <Icon type="star" /> : <div></div>
        )
      },
    }, {
      title: t('columns.referenceCount'),
      dataIndex: 'refCount',
      key: 'refCount',
      width: 200,
      render: (text) => {
        return (
          <div>{text}</div>
        )
      },
    }, {
      title: t('columns.buildDate'),
      dataIndex: 'buildDate',
      key: 'buildDate',
      width: 200,
      render: (text) => {
        return (
          <div>
            {formatDate(text)}
          </div>
        )
      },
    }, {
      title: '',
      key: 'operation',
      width: 100,
      render: (text, record) => {
        return (
          <EngineImageActions {...engineImageActionsProps} selected={record} />
        )
      },
    },
  ]

  const pagination = false

  return (
    <div>
      <Table
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
  deleteEngineImage: PropTypes.func,
  t: PropTypes.func,
}

export default withTranslation()(list)
