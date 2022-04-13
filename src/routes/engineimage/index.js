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

class EngineImage extends React.Component {
  render() {
    const { dispatch, loading, location } = this.props
    const { data, createEngineImageModalVisible, createEngineImageModalKey } = this.props.engineimage
    const { field, value } = queryString.parse(this.props.location.search)
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
          pathname: '/engineimage',
          search: queryString.stringify({
            ...queryString.parse(location.search),
            field: filterField,
            value: filterValue,
          }),
        })) : dispatch(routerRedux.push({
          pathname: '/engineimage',
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
          <Col lg={{ offset: 18, span: 6 }} md={{ offset: 16, span: 8 }} sm={24} xs={24} className="filter-input">
            <Filter {...engineImageFilterProps} />
          </Col>
        </Row>
        <Button className="out-container-button" size="large" type="primary" onClick={addEngineImage}>Deploy Engine Image</Button>
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
