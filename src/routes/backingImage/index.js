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
import queryString from 'query-string'
import style from './BackingImage.less'
import C from '../../utils/constants'

class BackingImage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      height: 300,
      message: null,
    }
  }

  componentDidMount() {
    let height = document.getElementById('backingImageTable').offsetHeight - C.ContainerMarginHeight
    this.setState({
      height,
    })
    window.onresize = () => {
      height = document.getElementById('backingImageTable').offsetHeight - C.ContainerMarginHeight
      this.setState({
        height,
      })
      this.props.dispatch({ type: 'app/changeNavbar' })
    }
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
    const { data, selected, createBackingImageModalVisible, createBackingImageModalKey, diskStateMapDetailModalVisible, diskStateMapDetailModalKey, diskStateMapDeleteDisabled, diskStateMapDeleteLoading, selectedDiskStateMapRows, selectedDiskStateMapRowKeys, selectedRows, cleanUp } = this.props.backingImage
    const { backingImageUploadPercent, backingImageUploadStarted } = this.props.app
    const { field, value } = queryString.parse(this.props.location.search)
    let backingImages = data.filter((item) => {
      if (field && value) {
        return item[field] && item[field].indexOf(value.trim()) > -1
      }
      return true
    })
    if (backingImages && backingImages.length > 0) {
      backingImages.sort((a, b) => a.name.localeCompare(b.name))
    }
    const volumeNameOptions = volumeData.map((volume) => volume.name)
    const backingImageListProps = {
      dataSource: backingImages,
      height: this.state.height,
      loading,
      deleteBackingImage(record) {
        dispatch({
          type: 'backingImage/delete',
          payload: record,
        })
      },
      cleanUpDiskMap(record) {
        dispatch({
          type: 'backingImage/showDiskStateMapDetailModal',
          payload: { record, cleanUp: true },
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
          payload: { record, cleanUp: false },
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
      cleanUp,
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
      ],
      onSearch(filter) {
        const { field: filterField, value: filterValue } = filter
        filterField && filterValue ? dispatch(routerRedux.push({
          pathname: '/backingImage',
          search: queryString.stringify({
            ...queryString.parse(location.search),
            field: filterField,
            value: filterValue,
          }),
        })) : dispatch(routerRedux.push({
          pathname: '/backingImage',
          search: queryString.stringify({}),
        }))
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
        { inUploadProgress ? <div className={style.backingImageUploadingContainer}>
          <div>
            <Progress percent={backingImageUploadPercent} />
            <span>Uploading</span>
          </div>
        </div> : ''}
        <Button className="out-container-button" size="large" type="primary" disabled={inUploadProgress || loading} onClick={addBackingImage}>Create Backing Image</Button>
        <BackingImageList {...backingImageListProps} />
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
