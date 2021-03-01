import React from 'react'
import PropTypes from 'prop-types'
import { routerRedux } from 'dva/router'
import { connect } from 'dva'
import { Row, Col, Button } from 'antd'
import CreateBackingImage from './CreateBackingImage'
import BackingImageList from './BackingImageList'
import DiskStateMapDetail from './DiskStateMapDetail'
import { Filter } from '../../components/index'
import queryString from 'query-string'

class BackingImage extends React.Component {
  render() {
    const { dispatch, loading, location } = this.props
    const { data, selected, createBackingImageModalVisible, createBackingImageModalKey, diskStateMapDetailModalVisible, diskStateMapDetailModalKey, diskStateMapDeleteDisabled, diskStateMapDeleteLoading, selectedDiskStateMapRows, selectedDiskStateMapRowKeys } = this.props.backingImage
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
    const backingImageListProps = {
      dataSource: backingImages,
      loading,
      deleteBackingImage(record) {
        dispatch({
          type: 'backingImage/delete',
          payload: record,
        })
      },
      showDiskStateMapDetail(record) {
        dispatch({
          type: 'backingImage/showDiskStateMapDetailModal',
          payload: record,
        })
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
      visible: createBackingImageModalVisible,
      onOk(newEngineImage) {
        dispatch({
          type: 'backingImage/create',
          payload: newEngineImage,
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
        onChange: (selectedRowKeys, selectedRows) => {
          if (selectedRowKeys.length === 0) {
            dispatch({ type: 'backingImage/disableDiskStateMapDelete' })
          } else {
            dispatch({ type: 'backingImage/enableDiskStateMapDelete' })
          }
          dispatch({
            type: 'backingImage/changeDiskStateMapSelection',
            payload: {
              selectedDiskStateMapRowKeys: selectedRowKeys,
              selectedDiskStateMapRows: selectedRows,
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

    return (
      <div className="content-inner">
        <Row gutter={24}>
          <Col lg={{ offset: 18, span: 6 }} md={{ offset: 16, span: 8 }} sm={24} xs={24} style={{ marginBottom: 16 }}>
            <Filter {...backingImageFilterProps} />
          </Col>
        </Row>
        <Button style={{ position: 'absolute', top: '-50px', right: '0px' }} size="large" type="primary" onClick={addBackingImage}>Create Backing Image</Button>
        <BackingImageList {...backingImageListProps} />
        { createBackingImageModalVisible ? <CreateBackingImage key={createBackingImageModalKey} {...createBackingImageModalProps} /> : ''}
        { diskStateMapDetailModalVisible ? <DiskStateMapDetail key={diskStateMapDetailModalKey} {...diskStateMapDetailModalProps} /> : ''}
      </div>
    )
  }
}

BackingImage.propTypes = {
  backingImage: PropTypes.object,
  loading: PropTypes.bool,
  location: PropTypes.object,
  dispatch: PropTypes.func,
}

export default connect(({ backingImage, loading }) => ({ backingImage, loading: loading.models.backingImage }))(BackingImage)
