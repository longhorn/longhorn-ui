import React from 'react'
import PropTypes from 'prop-types'
import { routerRedux } from 'dva/router'
import { connect } from 'dva'
import queryString from 'query-string'
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
    this.props.location.query = this.props.location.query ? this.props.location.query : {}
    const { field, value } = queryString.parse(location.serach)
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
          search: queryString.stringify({
            ...queryString.parse(location.search),
            field: filterField,
            keyword: filterValue,
          }),
        })) : dispatch(routerRedux.push({
          pathname: addPrefix('/engineimage'),
          search: queryString.stringify({}),
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
      <div className="content-inner">
        <Row gutter={24}>
          <Col lg={{ offset: 18, span: 6 }} md={{ offset: 16, span: 8 }} sm={24} xs={24} style={{ marginBottom: 16 }}>
            <Filter {...engineImageFilterProps} />
          </Col>
        </Row>
        <Button style={{ position: 'absolute', top: '-50px', right: '0px' }} size="large" type="primary" onClick={addEngineImage}>Deploy Engine Image</Button>
        <EngineImageList {...engineImageListProps} />
        { createEngineImageModalVisible ? <CreateEngineImage key={createEngineImageModalKey} {...createEngineImageModalProps} /> : ''}
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
