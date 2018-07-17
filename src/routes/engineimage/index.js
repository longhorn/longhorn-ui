import React, { PropTypes } from 'react'
import { routerRedux } from 'dva/router'
import { connect } from 'dva'
import EngineImageList from './EngineImageList'
import EngineImageFilter from './EngineImageFilter'
import CreateEngineImage from './CreateEngineImage'

class EngineImage extends React.Component {
  render() {
    const { dispatch, loading, location } = this.props
    const { data, createEngineImageModalVisible, createEngineImageModalKey } = this.props.engineimage
    const { field, keyword } = this.props.location.query

    const engineImageListProps = {
      dataSource: data,
      loading,
      deleteEngineImage(record) {
        dispatch({
          type: 'engineimage/delete',
          payload: record,
        })
      },
    }

    const engineImageFilterProps = {
      field,
      location,
      keyword,
      onSearch(fieldsValue) {
        fieldsValue.keyword.length ? dispatch(routerRedux.push({
          pathname: '/engineimage',
          query: {
            ...location.query,
            field: fieldsValue.field,
            keyword: fieldsValue.keyword,
          },
        })) : dispatch(routerRedux.push({
          pathname: '/engineimage',
          query: {
          },
        }))
      },
      onSelect() {
        dispatch(routerRedux.push({
          pathname: '/engineimage',
          query: {
            field: location.query.field,
            keyword: location.query.keyword,
          },
        }))
      },
      onAdd: () => {
        dispatch({
          type: 'engineimage/showCreateEngineImageModal',
        })
        this.setState({
          CreateEngineImageGen(createEngineImageModalProps) {
            return <CreateEngineImage {...createEngineImageModalProps} />
          },
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
      },
    }

    return (
      <div className="content-inner" >
        <EngineImageFilter {...engineImageFilterProps} />
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
