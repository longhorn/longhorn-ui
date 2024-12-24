import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Row, Col, Button, Progress, notification, Icon } from 'antd'
import CreateBackingImage from './CreateBackingImage'
import BackingImageList from './BackingImageList'
import DiskStateMapDetail from './DiskStateMapDetail'
import CreateBackupBackingImageModal from './CreateBackupBackingImageModal'
import { Filter } from '../../components/index'
import BackingImageBulkActions from './BackingImageBulkActions'
import UpdateMinCopiesCount from './UpdateMinCopiesCount'
import BackupBackingImage from './BackupBackingImage'
import { filterBackingImage } from './utils'
import { getBackupTargets } from '../../utils/backupTarget'
import style from './BackingImage.less'

class BackingImage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      height: 300,
      message: null,
      backupBackingImageModalVisible: false,
      selectedBackingImage: {},
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
    const biTableHeight = document.getElementById('backingImageTable').offsetHeight
    const tableHeaderHeight = 55
    const biTableClientHeight = document.querySelector('#backingImageTable .ant-table')?.clientHeight
    const biTableEle = document.querySelector('#backingImageTable .ant-table-body')

    if (biTableEle) biTableEle.style.height = `${biTableClientHeight - tableHeaderHeight}px`

    this.setState({
      height: biTableHeight,
    })
  }

  handleBackupBackingImageModalOpen = (record) => {
    this.setState({
      ...this.state,
      backupBackingImageModalVisible: true,
      selectedBackingImage: record,
    })
  }

  handleBackupBackingImageModalClose = () => {
    this.setState({
      ...this.state,
      backupBackingImageModalVisible: false,
      selectedBackingImage: {},
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
    const { data: settingData } = this.props.setting
    const { dispatch, loading, location, backupTarget } = this.props
    const { uploadFile, handleBackupBackingImageModalOpen, handleBackupBackingImageModalClose } = this
    const { backupBackingImageModalVisible, selectedBackingImage } = this.state
    const { data: volumeData } = this.props.volume
    const {
      data,
      biSearchField,
      biSearchValue,
      selected,
      nodeTags,
      diskTags,
      tagsLoading,
      minCopiesCountModalVisible,
      createBackingImageModalVisible,
      createBackingImageModalKey,
      diskStateMapDetailModalVisible,
      diskStateMapDetailModalKey,
      diskStateMapDeleteDisabled,
      diskStateMapDeleteLoading,
      selectedDiskStateMapRows,
      selectedDiskStateMapRowKeys,
      selectedRows,
    } = this.props.backingImage
    const { backingImageUploadPercent, backingImageUploadStarted } = this.props.app

    const settingsMap = Object.fromEntries(settingData.map(setting => [setting.id, setting.value]))
    const v1DataEngineEnabled = settingsMap['v1-data-engine'] === 'true'
    const v2DataEngineEnabled = settingsMap['v2-data-engine'] === 'true'
    const defaultReplicaCount = settingsMap['default-replica-count']
    const defaultNumberOfReplicas = defaultReplicaCount ? parseInt(defaultReplicaCount, 10) : 3

    const backingImages = filterBackingImage(data, biSearchField, biSearchValue)
    const volumeNameOptions = volumeData.map((volume) => volume.name)
    const backupTargets = getBackupTargets(backupTarget)

    const backingImageListProps = {
      dataSource: backingImages,
      height: this.state.height,
      backupProps: this.props.backup,
      loading,
      showUpdateMinCopiesCount(record) {
        dispatch({
          type: 'backingImage/showUpdateMinCopiesCountModal',
          payload: record,
        })
      },
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
      openBackupBackingImageModal: (record) => {
        handleBackupBackingImageModalOpen(record)
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

    const createBackupBackingImageModalProps = {
      backingImage: selectedBackingImage,
      backupTargets,
      visible: backupBackingImageModalVisible,
      onOk(url, payload) {
        dispatch({
          type: 'backingImage/createBackingImageBackup',
          url,
          payload,
        })
        handleBackupBackingImageModalClose()
      },
      onCancel() {
        handleBackupBackingImageModalClose()
      },
    }

    const addBackingImage = () => {
      dispatch({
        type: 'backingImage/openCreateBackingImageModal',
      })
    }

    const createBackingImageModalProps = {
      item: {
        name: '',
        url: '',
      },
      volumeNameOptions,
      defaultNumberOfReplicas,
      backingImageOptions: backingImages,
      visible: createBackingImageModalVisible,
      nodeTags,
      diskTags,
      tagsLoading,
      v1DataEngineEnabled,
      v2DataEngineEnabled,
      onOk(newBackingImage) {
        const payload = { ...newBackingImage }
        if (newBackingImage.sourceType === 'upload') {
          delete payload.fileContainer
          notification.warning({
            message: 'Do not refresh or close this page, otherwise the upload will be interrupted.',
            key: 'uploadNotification',
            duration: 0,
          })
        }
        dispatch({
          type: 'backingImage/create',
          payload,
          callback: (record, canUpload) => {
            const file = newBackingImage?.fileContainer?.file
            // to do upload
            if (newBackingImage.sourceType === 'upload' && file && canUpload) {
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

    const backingImageFilterProps = {
      location,
      defaultField: 'name',
      fieldOption: [
        { value: 'name', name: 'Name' },
        { value: 'uuid', name: 'UUID' },
        { value: 'sourceType', name: 'Created From' },
        { value: 'minNumberOfCopies', name: 'Minimum Copies' },
        { value: 'nodeSelector', name: 'Node Tags' },
        { value: 'diskSelector', name: 'Disk Tags' },
      ],
      createdFromOption: [
        { value: 'download', name: 'download' },
        { value: 'upload', name: 'upload' },
        { value: 'export-from-volume', name: 'export-from-volume' },
        { value: 'clone', name: 'clone' },
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
      backupProps: this.props.backup,
      backupTargets,
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
      }
    }

    const minCopiesCountProps = {
      item: selected,
      visible: minCopiesCountModalVisible,
      defaultNumberOfReplicas,
      onOk(record, newCount) {
        dispatch({
          type: 'backingImage/updateMinCopiesCount',
          payload: {
            url: record?.actions?.updateMinNumberOfCopies || '',
            params: { minNumberOfCopies: newCount },
          },
        })
      },
      onCancel() {
        dispatch({
          type: 'backingImage/hideUpdateMinCopiesCountModal',
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
          <span style={{ marginLeft: '4px' }}>Backing Image Backup</span>
        </div>
        <BackupBackingImage
          className={style.backupBackingImage}
          location={location}
          v1DataEngineEnabled={v1DataEngineEnabled}
          v2DataEngineEnabled={v2DataEngineEnabled}
        />
        {inUploadProgress && (
          <div className={style.backingImageUploadingContainer}>
            <Progress percent={backingImageUploadPercent} />
            <span>Uploading</span>
          </div>
        )}
        { minCopiesCountModalVisible && <UpdateMinCopiesCount {...minCopiesCountProps} />}
        { createBackingImageModalVisible ? <CreateBackingImage key={createBackingImageModalKey} {...createBackingImageModalProps} /> : ''}
        { diskStateMapDetailModalVisible ? <DiskStateMapDetail key={diskStateMapDetailModalKey} {...diskStateMapDetailModalProps} /> : ''}
        <CreateBackupBackingImageModal {...createBackupBackingImageModalProps} />
      </div>
    )
  }
}

BackingImage.propTypes = {
  app: PropTypes.object,
  setting: PropTypes.object,
  backingImage: PropTypes.object,
  backupTarget: PropTypes.object,
  loading: PropTypes.bool,
  location: PropTypes.object,
  volume: PropTypes.object,
  backup: PropTypes.object,
  dispatch: PropTypes.func,
}

export default connect(({ app, setting, backup, backupTarget, volume, backingImage, loading }) => ({ app, setting, backupTarget, volume, backup, backingImage, loading: loading.models.backingImage }))(BackingImage)
