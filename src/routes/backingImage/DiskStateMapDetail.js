import React from 'react'
import PropTypes from 'prop-types'
import { Table, Modal, Progress, Tooltip, Card, Icon } from 'antd'
import DiskStateMapActions from './DiskStateMapActions'
import { ModalBlur, DropOption } from '../../components'
import style from './BackingImage.less'
const confirm = Modal.confirm

// As the back-end field changes from diskStateMap to diskFileStatusMap
// The data has been changed to be taken from diskFileStatusMap.
// Many methods and components are named using the diskStateMap naming style, If changing this requires a lot of work.
// So the naming of some components and methods have not been changed to diskFileStatusMap

const modal = ({
  visible,
  selected,
  backingImages,
  onCancel,
  deleteDisksOnBackingImage,
  selectedRows,
  rowSelection,
  diskStateMapDeleteDisabled,
  diskStateMapDeleteLoading,
  // CleanUp is true if this popup is for a delete operation
  cleanUp,
}) => {
  // update detail list
  let currentData = backingImages.find((item) => {
    return item.id === selected.id
  })

  const modalOpts = {
    title: cleanUp ? 'Operate files in disks' : currentData.name,
    visible,
    onCancel,
    hasOnCancel: true,
    width: 780,
    maxHeight: 800,
    style: {
      top: 0,
    },
    okText: 'Close',
    footer: null,
    bodyStyle: { padding: '0px' },
  }

  const handleMenuClick = (record, event) => {
    switch (event.key) {
      case 'delete':
        confirm({
          title: `Are you sure to delete the images image file from the disk ${record.disk} ?`,
          onOk() {
            deleteDisksOnBackingImage([record])
          },
        })
        break
      default:
    }
  }

  const dataSource = currentData && currentData.diskFileStatusMap ? Object.keys(currentData.diskFileStatusMap).map((key) => {
    let diskFileStatusMap = currentData.diskFileStatusMap[key]

    return {
      status: diskFileStatusMap.state,
      message: diskFileStatusMap.message,
      disk: key,
      progress: currentData.diskFileStatusMap[key] && currentData.diskFileStatusMap[key].progress ? parseInt(currentData.diskFileStatusMap[key].progress, 10) : 0,
    }
  }) : []

  const columns = [
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      className: 'active',
      render: (text, record) => {
        return (
          <div>
            { text === 'in-progress' ? <Tooltip title={`${record.progress}%`}><div><Progress showInfo={false} percent={record.progress} /></div></Tooltip> : ''}
            <Tooltip title={record.message}>
              <div>{text} {record.message ? <Icon type="message" className="color-warning" /> : ''}</div>
            </Tooltip>
          </div>
        )
      },
    }, {
      title: 'Disk',
      dataIndex: 'disk',
      key: 'disk',
      render: (text) => {
        return (
          <div>{text}</div>
        )
      },
    },
  ]

  // If cleanUp is true tableRowSelection will equal props rowSelection, to support select rows.
  let tableRowSelection = null

  if (cleanUp) {
    tableRowSelection = rowSelection
    columns.push({
      title: 'Operation',
      key: 'operation',
      width: 100,
      render: (text, record) => {
        return (
          <DropOption menuOptions={[
            { key: 'delete', name: 'Delete' },
          ]}
            onMenuClick={e => handleMenuClick(record, e)}
          />
        )
      },
    })
  }

  const diskStateMapProps = {
    selectedRows,
    deleteButtonDisabled: diskStateMapDeleteDisabled,
    deleteButtonLoading: diskStateMapDeleteLoading,
    deleteDisksOnBackingImage,
  }

  const pagination = true

  const isReady = dataSource.every((item) => {
    return item.status === 'ready'
  })

  return (
    <ModalBlur {...modalOpts}>
      <div style={{ width: '100%', overflow: 'auto', padding: '10px 20px 10px' }}>
        { !cleanUp ? <div className={style.backingImageModalContainer}>
          <Card>
            <div className={style.parametersContainer} style={{ marginBottom: 0 }}>
              <div>UUID: </div>
              <span>{currentData.uuid}</span>
              <div>Created From: </div>
              <span>
                {currentData.sourceType === 'download' && 'Download from URL'}
                {currentData.sourceType === 'upload' && 'Upload'}
                {currentData.sourceType === 'export-from-volume' && 'Export from a Longhorn volume'}
              </span>
              <div style={{ textAlign: 'left' }}>Parameters During Creation:</div>
              <div>
                {currentData.parameters && Object.keys(currentData.parameters).length > 0 ? Object.keys(currentData.parameters).map((key) => {
                  return <div style={{ display: 'flex' }} key={key}>
                    <div style={{ minWidth: 60, fontWeight: 'normal' }}>{key}:</div>
                    <div style={{ marginLeft: 10, fontWeight: 'normal' }}>{currentData.parameters[key]}</div>
                  </div>
                }) : <Tooltip title="empty"><Icon type="stop" className="color-warning" /></Tooltip>}
              </div>
            </div>
          </Card>
          <Card>
            <div className={style.parametersContainer}>
              { currentData.expectedChecksum && currentData.expectedChecksum !== currentData.currentChecksum ? <div style={{ textAlign: 'left' }}>Expected SHA512 Checksum:</div> : '' }
              { currentData.expectedChecksum && currentData.expectedChecksum !== currentData.currentChecksum ? <span>{currentData.expectedChecksum}</span> : '' }
              <div className={style.currentChecksum}>
                { currentData.expectedChecksum === currentData.currentChecksum && currentData.currentChecksum !== '' && isReady ? <Tooltip title={'Current checksum is the same as the expected value'}>
                  <summary className="color-success">Verified</summary>
                </Tooltip> : ((currentData.expectedChecksum !== '' && isReady) && <Tooltip title={'Current checksum doesn’t match the expected value'}>
                  <summary className="color-error">Failed</summary>
                </Tooltip>)}
                Current SHA512 Checksum:
              </div>
              <span>{currentData.currentChecksum ? currentData.currentChecksum : ''}</span>
            </div>
          </Card>
        </div> : ''}
        <div style={{ marginBottom: 12 }}>
          { cleanUp ? <DiskStateMapActions {...diskStateMapProps} /> : '' }
        </div>
        <Table
          bordered={false}
          columns={columns}
          dataSource={dataSource}
          simple
          size="small"
          pagination={pagination}
          rowSelection={tableRowSelection}
          rowKey={record => record.disk}
        />
      </div>
    </ModalBlur>
  )
}

modal.propTypes = {
  visible: PropTypes.bool,
  cleanUp: PropTypes.bool,
  diskStateMapDeleteDisabled: PropTypes.bool,
  diskStateMapDeleteLoading: PropTypes.bool,
  selected: PropTypes.object,
  backingImages: PropTypes.array,
  onCancel: PropTypes.func,
  selectedRows: PropTypes.array,
  deleteDisksOnBackingImage: PropTypes.func,
  rowSelection: PropTypes.object,
}

export default modal
