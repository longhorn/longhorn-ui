import React from 'react'
import PropTypes from 'prop-types'
import { routerRedux } from 'dva/router'
import { connect } from 'dva'
import { Row, Col, Select } from 'antd'
import { Filter } from '../../components/index'
import OrphanedDataList from './orphanedDataList'
import OrphanedDataBulkActions from './orphanedDataBulkActions'
import queryString from 'query-string'
import C from '../../utils/constants'

const Option = Select.Option

class OrphanedData extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      height: 300,
      selectedRows: [],
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
    const height = document.getElementById('orphanedDataTable').offsetHeight - C.ContainerMarginHeight
    this.setState({
      height,
    })
  }

  onResourceTypeChange = () => {
    // to do -> Support other resource type
    return null
  }

  render() {
    const { loading, dispatch, location, orphanedData } = this.props
    const data = orphanedData.data
    const me = this

    const orphanedDataBulkActionsProps = {
      selectedRows: this.state.selectedRows,
      deleteorphanedData(record) {
        if (record?.length > 0) {
          dispatch({
            type: 'orphanedData/bulkDelete',
            payload: record.map(item => { return { name: item.name } }),
            callback: () => {
              me.setState({
                ...me.state,
                selectedRows: [],
              })
            },
          })
        }
      },
    }

    const orphanedDataListProps = {
      dataSource: data,
      rowSelection: {
        selectedRowKeys: this.state.selectedRows.map(item => item.id),
        onChange(_, records) {
          me.setState({
            ...me.state,
            selectedRows: records,
          })
        },
      },
      deleteOrphanedData(record) {
        if (record?.name) {
          dispatch({
            type: 'orphanedData/delete',
            payload: { name: record.name },
          })
        }
      },
      height: this.state.height,
      loading,
    }

    const orphanedDataFilterProps = {
      location,
      defaultField: 'node',
      fieldOption: [
        { value: 'node', name: 'Node' },
        { value: 'diskName', name: 'Disk Name' },
        { value: 'diskPath', name: 'Disk Path' },
        { value: 'directoryName', name: 'Directory Name' },
      ],
      onSearch(filter) {
        const { field: filterField, value: filterValue } = filter
        filterField && filterValue ? dispatch(routerRedux.push({
          pathname: '/orphanedData',
          search: queryString.stringify({
            ...queryString.parse(location.search),
            field: filterField,
            value: filterValue,
          }),
        })) : dispatch(routerRedux.push({
          pathname: '/orphanedData',
          search: queryString.stringify({}),
        }))
      },
    }

    return (
      <div className="content-inner" style={{ display: 'flex', flexDirection: 'column', overflow: 'visible !important' }}>
        <Row gutter={24} className="filter-input">
          <Col lg={{ span: 6 }} md={{ span: 8 }} sm={24} xs={24}>
            <div style={{ display: 'flex' }}>
              <Select size="large" value={'replica'} style={{ width: 120, marginLeft: 5 }} onChange={(value) => this.onResourceTypeChange(value)}>
                <Option value="replica">Replica</Option>
              </Select>
              <OrphanedDataBulkActions {...orphanedDataBulkActionsProps} />
            </div>
          </Col>
          <Col lg={{ offset: 11, span: 7 }} md={{ offset: 5, span: 10 }} sm={24} xs={24}>
            <Filter {...orphanedDataFilterProps} />
          </Col>
        </Row>
        <OrphanedDataList {...orphanedDataListProps} />
      </div>
    )
  }
}

OrphanedData.propTypes = {
  orphanedData: PropTypes.object,
  loading: PropTypes.bool,
  location: PropTypes.object,
  dispatch: PropTypes.func,
}

export default connect(({ orphanedData, loading }) => ({ orphanedData, loading: loading.models.orphanedData }))(OrphanedData)
