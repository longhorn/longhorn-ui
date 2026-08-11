import React from 'react'
import PropTypes from 'prop-types'
import { Table, Button, Icon, Tooltip, Tag } from 'antd'
import BackingImageActions from './BackingImageActions'
import { pagination } from '../../utils/page'
import { formatMib } from '../../utils/formatter'
import { nodeTagColor, diskTagColor } from '../../utils/constants'
import styles from './BackingImageList.less'
import { withTranslation } from 'react-i18next'

function list({
  loading,
  dataSource,
  openBackupBackingImageModal,
  backupProps,
  deleteBackingImage,
  showDiskStateMapDetail,
  rowSelection,
  createBackupBackingImage,
  downloadBackingImage,
  showUpdateMinCopiesCount,
  height,
  t,
}) {
  const backingImageActionsProps = {
    deleteBackingImage,
    downloadBackingImage,
    createBackupBackingImage,
    showUpdateMinCopiesCount,
    openBackupBackingImageModal,
    backupProps,
  }

  const dynamicStateIcon = (record) => {
    if (record.deletionTimestamp) {
      // Deleting
      return (
        <Tooltip title={t('backingImageList.dynamicStateIcon.deleting')}>
          <Icon type="delete" className="color-error" />
        </Tooltip>
      )
    }
    return ''
  }

  const staticStateIcon = (record) => {
    if (record.secret !== '' || record.secretNamespace !== '') {
      // encrypted backing image
      return (
        <Tooltip title={t('common.encrypted')}>
          <Icon className="color-warning" type="lock" />
        </Tooltip>
      )
    }

    if (record.diskFileStatusMap && Object.values(record.diskFileStatusMap).every((diskStatus) => diskStatus.state.includes('failed'))) {
      // unavailable backing image
      return (<Tooltip title={t('backingImageList.staticStateIcon.unavailable')}><Icon type="warning" style={{ marginLeft: 10, color: '#f5222d' }} /></Tooltip>)
    }

    return ''
  }

  const columns = [
    {
      title: t('columns.name'),
      dataIndex: 'name',
      key: 'name',
      width: 180,
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text, record) => {
        return (
          <div onClick={() => { showDiskStateMapDetail(record) }}>
            {staticStateIcon(record)}
            <Button type="link" className={styles.encryptedBackingImage}>{text}</Button>
            {dynamicStateIcon(record)}
          </div>
        )
      },
    }, {
      title: t('columns.uuid'),
      dataIndex: 'uuid',
      key: 'uuid',
      width: 140,
      sorter: (a, b) => a.uuid.localeCompare(b.uuid),
      render: (text) => {
        return (
          <div>{text}</div>
        )
      },
    }, {
      title: (
        <span>
          {t('columns.actualSize')}&nbsp;
          <Tooltip title={t('columns.actualSizeTooltip')}>
            <Icon type="exclamation-circle" />
          </Tooltip>
        </span>
      ),
      dataIndex: 'size',
      key: 'size',
      width: 160,
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
      title: (
        <span>
          {t('columns.virtualSize')}&nbsp;
          <Tooltip title={t('columns.virtualSizeTooltip')}>
            <Icon type="exclamation-circle" />
          </Tooltip>
        </span>
      ),
      dataIndex: 'virtualSize',
      key: 'virtualSize',
      width: 160,
      sorter: (a, b) => a.virtualSize - b.virtualSize,
      render: (text) => {
        return (
          <div>
            {formatMib(text)}
          </div>
        )
      },
    },
    {
      title: t('columns.createdFrom'),
      dataIndex: 'sourceType',
      key: 'sourceType',
      width: 120,
      sorter: (a, b) => a.sourceType.localeCompare(b.sourceType),
      render: (text) => {
        return (
          <div>
            {text}
          </div>
        )
      },
    }, {
      title: t('columns.minimumCopies'),
      dataIndex: 'minNumberOfCopies',
      key: 'minNumberOfCopies',
      width: 130,
      sorter: (a, b) => a.minNumberOfCopies.toString().localeCompare(b.minNumberOfCopies.toString()),
      render: (text) => {
        return (
          <div>
            {text}
          </div>
        )
      },
    }, {
      title: t('columns.dataEngine'),
      dataIndex: 'dataEngine',
      key: 'dataEngine',
      width: 130,
      sorter: (a, b) => (a.dataEngine || '').toString().localeCompare((b.dataEngine || '').toString()),
      render: (text) => {
        return (
          <div>
            {text}
          </div>
        )
      },
    }, {
      title: t('columns.nodeTags'),
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
      title: t('columns.diskTags'),
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
      title: t('columns.operation'),
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
    <Table
      className="common-table-class"
      bordered={false}
      columns={columns}
      rowSelection={rowSelection}
      dataSource={dataSource}
      loading={loading}
      simple
      pagination={pagination('backingImagePageSize')}
      rowKey={record => record.id}
      scroll={{ x: 970, y: dataSource.length > 0 ? height : 1 }}
    />
  )
}

list.propTypes = {
  loading: PropTypes.bool,
  dataSource: PropTypes.array,
  createBackupBackingImage: PropTypes.func,
  deleteBackingImage: PropTypes.func,
  showDiskStateMapDetail: PropTypes.func,
  showUpdateMinCopiesCount: PropTypes.func,
  openBackupBackingImageModal: PropTypes.func,
  rowSelection: PropTypes.object,
  height: PropTypes.number,
  backupProps: PropTypes.object,
  t: PropTypes.func,
}

export default withTranslation()(list)
