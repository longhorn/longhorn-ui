import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Row, Col, Button, Progress, notification, Icon } from 'antd'
import CreateBackingImage from './CreateBackingImage'
import BackingImageList from './BackingImageList'
import BackupBackingImageList from './BackupBackingImageList'
import DiskStateMapDetail from './DiskStateMapDetail'
import { Filter } from '../../components/index'
import BackingImageBulkActions from './BackingImageBulkActions'
import BackupBackingImageBulkActions from './BackupBackingImageBulkActions'
import style from './BackingImage.less'

const filterBackupBackingImage = (bbiData, field, value) => {
  if (!bbiData || bbiData.length === 0) {
    return []
  }
  let result = [...bbiData]
  if (field && (value)) {
    switch (field) {
      case 'name':
        result = bbiData.filter((image) => (value ? image.name.includes(value.trim()) : true))
        break
      case 'state':
        result = bbiData.filter((image) => (value ? image.state.toLowerCase().includes(value.toLowerCase().trim()) : true))
        break
      case 'url':
        result = bbiData.filter((image) => (value ? image.url.toLowerCase().includes(value.toLowerCase().trim()) : true))
        break
      default:
        break
    }
  }
  return result
}

const filterBackingImage = (backingImages, field, value) => {
  if (!backingImages || backingImages.length === 0) {
    return []
  }
  let result = [...backingImages]
  if (field && value) {
    switch (field) {
      case 'name':
        result = backingImages.filter((image) => (value ? image.name.includes(value.trim()) : true))
        break
      case 'uuid':
        result = backingImages.filter((image) => (value ? image.uuid.includes(value.trim()) : true))
        break
      case 'sourceType':
        result = backingImages.filter((image) => (value ? image.sourceType === value.trim() : true))
        break
      default:
        break
    }
  }
  return result
}
class BackingImage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      bbiTableHeight: 300,
      height: 300,
      message: null,
    }
  }

  componentDidMount() {
    this.onResize()
    window.addEventListener('resize', this.onResize)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize)
  }

  onResize = () => {
    const bbiTableHeight = document.getElementById('backupBackingImageTable').offsetHeight
    const biTableHeight = document.getElementById('backingImageTable').offsetHeight

    const tableHeaderHeight = 55

    const biTableClientHeight = document.querySelector('#backingImageTable .ant-table')?.clientHeight
    const biTableEle = document.querySelector('#backingImageTable .ant-table-body')

    const bbiTableClientHeight = document.querySelector('#backupBackingImageTable .ant-table')?.clientHeight
    const bbiTableEle = document.querySelector('#backupBackingImageTable .ant-table-body')

    if (biTableEle) biTableEle.style.height = `${biTableClientHeight - tableHeaderHeight}px`
    if (bbiTableEle) bbiTableEle.style.height = `${bbiTableClientHeight - tableHeaderHeight}px`

    this.setState({
      height: biTableHeight,
      bbiTableHeight,
    })
  }


  uploadFile = (file, record) => {
    let totalSize = file.size
    this.props.dispatch({
      type: 'backingImage/singleInterfaceUpload',
      payload: {
        file,
        size: totalSize,
        url: record.actions.upload,
        onProgress: (e) => {
          if (e.loaded) {
            this.props.dispatch({
              type: 'app/backingImageUploadProgress',
              payload: {
                backingImageUploadPercent: parseInt((e.loaded / totalSize) * 100, 10),
              },
            })
          }
        },
      },
      callback: () => {
        // to do disabled loading
        notification.close('uploadNotification')
        notification.destroy()
      },
    })
  }

  render() {
    const { dispatch, loading, location } = this.props
    const { uploadFile } = this
    const { data: volumeData } = this.props.volume
    const { data, bbiData, biSearchField, biSearchValue, bbiSearchField, bbiSearchValue, selected, createBackingImageModalVisible, createBackingImageModalKey, diskStateMapDetailModalVisible, diskStateMapDetailModalKey, diskStateMapDeleteDisabled, diskStateMapDeleteLoading, selectedDiskStateMapRows, selectedDiskStateMapRowKeys, selectedRows, bbiSelectedRows } = this.props.backingImage
    const { backingImageUploadPercent, backingImageUploadStarted } = this.props.app

    const backingImages = filterBackingImage(data, biSearchField, biSearchValue)
    const backupBackingImage = filterBackupBackingImage(bbiData, bbiSearchField, bbiSearchValue)

    const volumeNameOptions = volumeData.map((volume) => volume.name)

    const backupBackingImageListProps = {
      dataSource: backupBackingImage,
      height: this.state.bbiTableHeight,
      loading,
      deleteBackupBackingImage(record) {
        dispatch({
          type: 'backingImage/deleteBackupBackingImage',
          payload: record,
        })
      },
      restoreBackingImage(record) {
        dispatch({
          type: 'backingImage/restoreBackingImage',
          payload: record,
        })
      },
      rowSelection: {
        selectedRowKeys: bbiSelectedRows.map(item => item.id),
        onChange(_, records) {
          dispatch({
            type: 'backingImage/changeSelection',
            payload: {
              bbiSelectedRows: records,
            },
          })
        },
      },
    }

    const backingImageListProps = {
      dataSource: backingImages,
      height: this.state.height,
      loading,
      createBackupBackingImage(record) {
        dispatch({
          type: 'backingImage/createBackupBackingImage',
          payload: record,
        })
      },
      deleteBackingImage(record) {
        dispatch({
          type: 'backingImage/delete',
          payload: record,
        })
      },
      downloadBackingImage(record) {
        dispatch({
          type: 'backingImage/downloadBackingImage',
          payload: record,
        })
      },
      showDiskStateMapDetail(record) {
        dispatch({
          type: 'backingImage/showDiskStateMapDetailModal',
          payload: { record },
        })
      },
      rowSelection: {
        selectedRowKeys: selectedRows.map(item => item.id),
        onChange(_, records) {
          dispatch({
            type: 'backingImage/changeSelection',
            payload: {
              selectedRows: records,
            },
          })
        },
      },
    }

    const addBackingImage = () => {
      dispatch({
        type: 'backingImage/showCreateBackingImageModal',
      })
    }

    const createBackingImageModalProps = {
      item: {
        name: '',
        url: '',
      },
      volumeNameOptions,
      visible: createBackingImageModalVisible,
      onOk(newBackingImage) {
        let params = {}
        params.name = newBackingImage.name
        if (newBackingImage.type === 'upload') {
          params.sourceType = 'upload'
          params.parameters = {}

          // notification.warning
          notification.warning({
            message: 'Do not refresh or close this page, otherwise the upload will be interrupted.',
            key: 'uploadNotification',
            duration: 0,
          })
        } else if (newBackingImage.type === 'download') {
          params.sourceType = 'download'
          params.parameters = {
            url: newBackingImage.imageURL,
          }
        } else {
          params.sourceType = 'export-from-volume'
          params.parameters = {
            'volume-name': newBackingImage.volumeName,
            'export-type': newBackingImage.exportType,
          }
        }
        params.expectedChecksum = newBackingImage.expectedChecksum

        dispatch({
          type: 'backingImage/create',
          payload: params,
          callback: (record, canUpload) => {
            // to do upload
            if (newBackingImage.fileContainer && newBackingImage.fileContainer.file && newBackingImage.type === 'upload' && canUpload) {
              let file = newBackingImage.fileContainer.file
              uploadFile(file, record)
            } else {
              notification.close('uploadNotification')
            }
          },
        })
      },
      onCancel() {
        dispatch({
          type: 'backingImage/hideCreateBackingImageModal',
        })
        dispatch({
          type: 'app/changeBlur',
          payload: false,
        })
      },
    }

    const diskStateMapDetailModalProps = {
      selected,
      backingImages,
      visible: diskStateMapDetailModalVisible,
      onCancel: () => {
        dispatch({ type: 'backingImage/hideDiskStateMapDetailModal' })
        dispatch({ type: 'backingImage/disableDiskStateMapDelete' })
        dispatch({
          type: 'backingImage/changeDiskStateMapSelection',
          payload: {
            selectedDiskStateMapRowKeys: [],
            selectedDiskStateMapRows: [],
          },
        })
      },
      deleteDisksOnBackingImage: (record) => {
        dispatch({
          type: 'backingImage/deleteDisksOnBackingImage',
          payload: {
            selected,
            rows: record,
          },
        })
      },
      selectedRows: selectedDiskStateMapRows,
      rowSelection: {
        selectedRowKeys: selectedDiskStateMapRowKeys,
        onChange: (selectedDiskRowKeys, selectedDiskRows) => {
          if (selectedDiskRowKeys.length === 0) {
            dispatch({ type: 'backingImage/disableDiskStateMapDelete' })
          } else {
            dispatch({ type: 'backingImage/enableDiskStateMapDelete' })
          }
          dispatch({
            type: 'backingImage/changeDiskStateMapSelection',
            payload: {
              selectedDiskStateMapRowKeys: selectedDiskRowKeys,
              selectedDiskStateMapRows: selectedDiskRows,
            },
          })
        },
      },
      diskStateMapDeleteDisabled,
      diskStateMapDeleteLoading,
    }

    const backupBackingImageFilterProps = {
      location,
      defaultField: 'name',
      fieldOption: [
        { value: 'name', name: 'Name' },
        { value: 'state', name: 'State' },
        { value: 'url', name: 'URL' },
      ],
      onSearch(filter) {
        dispatch({
          type: 'backingImage/setSearchFilter',
          payload: {
            bbiSearchField: filter.field,
            bbiSearchValue: filter.value,
          },
        })
      },
    }

    const backingImageFilterProps = {
      location,
      defaultField: 'name',
      fieldOption: [
        { value: 'name', name: 'Name' },
        { value: 'uuid', name: 'UUID' },
        { value: 'sourceType', name: 'Created From' },
      ],
      createdFromOption: [
        { value: 'download', name: 'download' },
        { value: 'upload', name: 'upload' },
        { value: 'export-from-volume', name: 'export-from-volume' },
        { value: 'restore', name: 'restore' },
      ],
      onSearch(filter) {
        dispatch({
          type: 'backingImage/setSearchFilter',
          payload: {
            biSearchField: filter.field,
            biSearchValue: filter.value,
          },
        })
      },
    }

    const backingImageBulkActionsProps = {
      selectedRows,
      deleteBackingImages(record) {
        dispatch({
          type: 'backingImage/bulkDelete',
          payload: record,
        })
      },
      downloadSelectedBackingImages(record) {
        dispatch({
          type: 'backingImage/bulkDownload',
          payload: record,
        })
      },
      backupSelectedBackingImages(record) {
        dispatch({
          type: 'backingImage/bulkBackup',
          payload: record,
        })
      },
    }

    const backupBackingImageBulkActionsProps = {
      bbiSelectedRows,
      deleteBackupBackingImages(records) {
        dispatch({
          type: 'backingImage/bulkDeleteBackupBackingImage',
          payload: records,
        })
      },
    }

    const inUploadProgress = backingImageUploadStarted

    return (
      <div className="content-inner" style={{ display: 'flex', padding: 0, flexDirection: 'column', overflow: 'visible !important' }}>
        <div id="backingImageTable" style={{ height: '50%', padding: '8px 12px 0px' }}>
          <Row gutter={24} style={{ marginBottom: 8 }}>
            <Col lg={17} md={15} sm={24} xs={24}>
              <BackingImageBulkActions {...backingImageBulkActionsProps} />
            </Col>
            <Col lg={7} md={9} sm={24} xs={24}>
              <Filter key="biFilter" {...backingImageFilterProps} />
            </Col>
          </Row>
          <Button className="out-container-button" size="large" type="primary" disabled={inUploadProgress || loading} onClick={addBackingImage}>
            Create Backing Image
          </Button>
          <Row style={{ marginBottom: 8, height: 'calc(100% - 48px)' }}>
            <BackingImageList {...backingImageListProps} />
          </Row>
        </div>
        <div className={style.backupBackingImageTitle}>
          <Icon type="file-image" className="ant-breadcrumb anticon" style={{ display: 'flex', alignItems: 'center' }} />
          <span style={{ marginLeft: '4px' }}>Backup Backing Image</span>
        </div>
        <div id="backupBackingImageTable" style={{ height: '45%', padding: '8px 12px 0px' }}>
          <Row gutter={24} style={{ marginBottom: 8 }}>
            <Col lg={17} md={15} sm={24} xs={24}>
              <BackupBackingImageBulkActions {...backupBackingImageBulkActionsProps} />
            </Col>
            <Col lg={7} md={9} sm={24} xs={24}>
              <Filter key="bbiFilter" {...backupBackingImageFilterProps} />
            </Col>
          </Row>
          <Row style={{ marginBottom: 8, height: 'calc(100% - 48px)' }}>
            <BackupBackingImageList {...backupBackingImageListProps} />
          </Row>
        </div>
        {inUploadProgress && (
          <div className={style.backingImageUploadingContainer}>
            <Progress percent={backingImageUploadPercent} />
            <span>Uploading</span>
          </div>
        )}
        { createBackingImageModalVisible ? <CreateBackingImage key={createBackingImageModalKey} {...createBackingImageModalProps} /> : ''}
        { diskStateMapDetailModalVisible ? <DiskStateMapDetail key={diskStateMapDetailModalKey} {...diskStateMapDetailModalProps} /> : ''}
      </div>
    )
  }
}

BackingImage.propTypes = {
  app: PropTypes.object,
  backingImage: PropTypes.object,
  loading: PropTypes.bool,
  location: PropTypes.object,
  volume: PropTypes.object,
  dispatch: PropTypes.func,
}

export default connect(({ app, volume, backingImage, loading }) => ({ app, volume, backingImage, loading: loading.models.backingImage }))(BackingImage)
