import React from 'react'
import PropTypes from 'prop-types'
import { routerRedux } from 'dva/router'
import { connect } from 'dva'
import { Row, Col, Button, Progress, notification } from 'antd'
import CreateBackingImage from './CreateBackingImage'
import BackingImageList from './BackingImageList'
import DiskStateMapDetail from './DiskStateMapDetail'
import { Filter } from '../../components/index'
import BackingImageBulkActions from './BackingImageBulkActions'
import UpdateMinCopiesCount from './UpdateMinCopiesCount'
import queryString from 'query-string'
import style from './BackingImage.less'
import C from '../../utils/constants'


const filterBackingImages = (data, search) => {
  const { field, value, createdFromValue } = queryString.parse(search)
  let backingImages = data
  if (field && (value || createdFromValue)) {
    switch (field) {
      case 'name':
      case 'uuid':
      case 'minNumberOfCopies':
      case 'diskSelector':
      case 'nodeSelector':
        backingImages = backingImages.filter((image) => (value ? image[field].toString().includes(value.toString().trim()) : true))
        break
      case 'sourceType':
        backingImages = backingImages.filter((image) => (createdFromValue ? image.sourceType === createdFromValue?.trim() : true))
        break
      default:
        break
    }
  }
  return backingImages && backingImages.length > 0 ? backingImages.sort((a, b) => a.name.localeCompare(b.name)) : []
}

class BackingImage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
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
    const height = document.getElementById('backingImageTable').offsetHeight - C.ContainerMarginHeight
    this.setState({
      height,
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
    const { data: settingData } = this.props.setting
    const { data: volumeData } = this.props.volume
    const {
      data,
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

    const defaultReplicaCount = settingData.find(s => s.id === 'default-replica-count')
    const defaultNumberOfReplicas = defaultReplicaCount ? parseInt(defaultReplicaCount.value, 10) : 3

    const backingImages = filterBackingImages(data, this.props.location.search)

    const volumeNameOptions = volumeData.map((volume) => volume.name)
    const backingImageListProps = {
      dataSource: backingImages,
      height: this.state.height,
      loading,
      showUpdateMinCopiesCount(record) {
        dispatch({
          type: 'backingImage/showUpdateMinCopiesCountModal',
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
        params.expectedChecksum = newBackingImage.expectedChecksum
        params.diskSelector = newBackingImage.diskSelector
        params.nodeSelector = newBackingImage.nodeSelector
        params.minNumberOfCopies = newBackingImage.minNumberOfCopies

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
      ],
      onSearch(filter) {
        const { field: filterField, value: filterValue, createdFromValue: createdFromPropValue } = filter
        if (filterField && (filterValue || createdFromPropValue)) {
          dispatch(routerRedux.push({
            pathname: '/backingImage',
            search: queryString.stringify({
              ...queryString.parse(location.search),
              field: filterField,
              value: filterValue,
              createdFromValue: createdFromPropValue,
            }),
          }))
        } else {
          dispatch(routerRedux.push({
            pathname: '/backingImage',
            search: queryString.stringify({}),
          }))
        }
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

    let inUploadProgress = backingImageUploadStarted

    return (
      <div className="content-inner" style={{ display: 'flex', flexDirection: 'column', overflow: 'visible !important' }}>
        <Row gutter={24} style={{ marginBottom: 8 }}>
          <Col lg={{ span: 4 }} md={{ span: 6 }} sm={24} xs={24}>
            <BackingImageBulkActions {...backingImageBulkActionsProps} />
          </Col>
          <Col lg={{ offset: 13, span: 7 }} md={{ offset: 8, span: 10 }} sm={24} xs={24}>
            <Filter {...backingImageFilterProps} />
          </Col>
        </Row>
        { inUploadProgress ? (
          <div className={style.backingImageUploadingContainer}>
            <div>
              <Progress percent={backingImageUploadPercent} />
              <span>Uploading</span>
            </div>
          </div>
        ) : ''}
        <Button className="out-container-button" size="large" type="primary" disabled={inUploadProgress || loading} onClick={addBackingImage}>
          Create Backing Image
        </Button>
        <BackingImageList {...backingImageListProps} />
        { minCopiesCountModalVisible && <UpdateMinCopiesCount {...minCopiesCountProps} />}
        { createBackingImageModalVisible ? <CreateBackingImage key={createBackingImageModalKey} {...createBackingImageModalProps} /> : ''}
        { diskStateMapDetailModalVisible ? <DiskStateMapDetail key={diskStateMapDetailModalKey} {...diskStateMapDetailModalProps} /> : ''}
      </div>
    )
  }
}

BackingImage.propTypes = {
  app: PropTypes.object,
  setting: PropTypes.object,
  backingImage: PropTypes.object,
  loading: PropTypes.bool,
  location: PropTypes.object,
  volume: PropTypes.object,
  dispatch: PropTypes.func,
}

export default connect(({ app, setting, volume, backingImage, loading }) => ({ app, setting, volume, backingImage, loading: loading.models.backingImage }))(BackingImage)
