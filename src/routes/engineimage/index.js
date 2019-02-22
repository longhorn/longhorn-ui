import React, { PropTypes } from 'react'
import { routerRedux } from 'dva/router'
import { connect } from 'dva'
import { Row, Col, Button } from 'antd'
import { Filter } from '../../components/index'
import EngineImageList from './EngineImageList'
import CreateEngineImage from './CreateEngineImage'
import { filterEngineImage } from '../../utils/filter'
import { addPrefix } from '../../utils/pathnamePrefix'

class EngineImage extends React.Component {
  render() {
    const { dispatch, loading, location } = this.props
    const { data, createEngineImageModalVisible, createEngineImageModalKey } = this.props.engineimage
    const { field, value } = this.props.location.query
    let engineimages = data
    if (field && value) {
      engineimages = filterEngineImage(data, field, value)
    }

    const engineImageListProps = {
      dataSource: engineimages,
      loading,
      deleteEngineImage(record) {
        dispatch({
          type: 'engineimage/delete',
          payload: record,
        })
      },
    }

    const createEngineImageModalProps = {
      item: {
        image: '',
      },
      visible: createEngineImageModalVisible,
      onOk(newEngineImage) {
        dispatch({
          type: 'engineimage/create',
          payload: newEngineImage,
        })
      },
      onCancel() {
        dispatch({
          type: 'engineimage/hideCreateEngineImageModal',
        })
        dispatch({
          type: 'app/changeBlur',
          payload: false,
        })
      },
    }

    const engineImageFilterProps = {
      location,
      defaultField: 'image',
      fieldOption: [
        { value: 'image', name: 'Image' },
      ],
      onSearch(filter) {
        const { field: filterField, value: filterValue } = filter
        filterField && filterValue ? dispatch(routerRedux.push({
          pathname: addPrefix('/engineimage'),
          query: {
            ...location.query,
            field: filterField,
            value: filterValue,
          },
        })) : dispatch(routerRedux.push({
          pathname: addPrefix('/engineimage'),
          query: {
          },
        }))
      },
    }

    const addEngineImage = () => {
      dispatch({
        type: 'engineimage/showCreateEngineImageModal',
      })
      this.setState({
        CreateEngineImageGen() {
          return <CreateEngineImage {...createEngineImageModalProps} />
        },
      })
    }

    return (
      <div className="content-inner" >
        <Row gutter={24}>
          <Col lg={{ offset: 18, span: 6 }} md={{ offset: 16, span: 8 }} sm={24} xs={24} style={{ marginBottom: 16 }}>
            <Filter {...engineImageFilterProps} />
          </Col>
        </Row>
        <Button style={{ position: 'absolute', top: '-50px', right: '0px' }} size="large" type="primary" onClick={addEngineImage}>Deploy Engine Image</Button>
        <EngineImageList {...engineImageListProps} />
        <CreateEngineImage key={createEngineImageModalKey} {...createEngineImageModalProps} />
      </div>
    )
  }
}

EngineImage.propTypes = {
  engineimage: PropTypes.object,
  loading: PropTypes.bool,
  location: PropTypes.object,
  dispatch: PropTypes.func,
}

export default connect(({ engineimage, loading }) => ({ engineimage, loading: loading.models.engineimage }))(EngineImage)
