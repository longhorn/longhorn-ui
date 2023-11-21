import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { routerRedux } from 'dva/router'
import CreateRecurringJob from './CreateRecurringJob'
import RecurringJobList from './RecurringJobList'
import { Filter } from '../../components/index'
import RecurringJobBulkActions from './RecurringJobBulkActions'
import queryString from 'query-string'
import { Row, Col, Button } from 'antd'
import C from '../../utils/constants'

class RecurringJob extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      height: 300,
      isEdit: false,
      selected: {},
      createRecurringJobModalVisible: false,
      createRecurringJobModalKey: Math.random(),
      currentCron: '0 0 * * *',
      modalCronOpts: {
        visible: false,
      },
      ReactCronKey: Math.random(),
      modulerCronDisabled: false,
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
    const height = document.getElementById('recurringJobTable').offsetHeight - C.ContainerMarginHeight
    this.setState({
      height,
    })
  }

  showCreateRecurringJobModal =() => {
    this.setState({
      ...this.state,
      isEdit: false,
      selected: {},
      createRecurringJobModalVisible: true,
      createRecurringJobModalKey: Math.random(),
    })
  }

  onCronCancel = () => {
    this.setState({
      ...this.state,
      modalCronOpts: {
        visible: false,
      },
    })
  }

  saveDisabled = () => {
    this.setState({
      ...this.state,
      modulerCronDisabled: true,
    })
  }

  changeCron = (cron) => {
    this.setState({
      ...this.state,
      currentCron: cron,
      modulerCronDisabled: false,
    })
  }

  openCronModal = () => {
    this.setState({
      ...this.state,
      modalCronOpts: {
        visible: true,
      },
      ReactCronKey: Math.random(),
    })
  }

  render() {
    const me = this
    const { dispatch, loading, location } = this.props
    const { data } = this.props.recurringJob
    const { field, value } = queryString.parse(this.props.location.search)
    // Front-end filtering
    let recurringJobs = data.filter((item) => {
      if (field === 'name') {
        return item[field] && item[field].indexOf(value.trim()) > -1
      } else if (field === 'groups' && value !== '') {
        if (item.groups && item.groups.length > 0) {
          return item.groups.includes(value)
        }
        return false
      } else if (field === 'label' && value !== '') {
        if (item.labels) {
          return item.labels[value] || Object.keys(item.labels).some((key) => {
            return item.labels[key] === value
          })
        }
        return false
      } else if (field === 'type' && value !== '') {
        if (item.task) {
          return item.task === value
        }
        return false
      }
      return true
    })
    if (recurringJobs && recurringJobs.length > 0) {
      recurringJobs.sort((a, b) => a.name.localeCompare(b.name))
    }

    const createRecurringJobModalProps = {
      item: this.state.selected,
      visible: this.state.createRecurringJobModalVisible,
      isEdit: this.state.isEdit,
      onOk(newRecurringJob) {
        me.setState({
          ...me.state,
          createRecurringJobModalVisible: false,
        })
        if (me.state.isEdit) {
          dispatch({
            type: 'recurringJob/edit',
            payload: newRecurringJob,
            callback: () => {
              me.setState({
                ...me.state,
                currentCron: '0 0 * * *',
              })
            },
          })
        } else {
          dispatch({
            type: 'recurringJob/create',
            payload: newRecurringJob,
            callback: () => {
              me.setState({
                ...me.state,
                currentCron: '0 0 * * *',
              })
            },
          })
        }
      },
      onCancel() {
        me.setState({
          ...me.state,
          createRecurringJobModalVisible: false,
          currentCron: '0 0 * * *',
        })
      },
      cronProps: {
        modulerCronDisabled: this.state.modulerCronDisabled,
        modalCronOpts: this.state.modalCronOpts,
        onCronCancel: this.onCronCancel,
        cron: this.state.currentCron,
        ReactCronKey: this.state.ReactCronKey,
        saveDisabled: this.saveDisabled,
        changeCron: this.changeCron,
        openCronModal: this.openCronModal,
      },
    }

    const recurringJobListProps = {
      dataSource: recurringJobs,
      height: this.state.height,
      loading,
      rowSelection: {
        selectedRowKeys: this.state.selectedRows.map(item => item.id),
        onChange(_, records) {
          me.setState({
            ...me.state,
            selectedRows: records,
          })
        },
      },
      deleteRecurringJob(record) {
        dispatch({
          type: 'recurringJob/delete',
          payload: record,
        })
      },
      editRecurringJob(record) {
        me.setState({
          ...me.state,
          isEdit: true,
          selected: record,
          currentCron: record.cron,
          createRecurringJobModalVisible: true,
          createRecurringJobModalKey: Math.random(),
        })
      },
    }

    const recurringJobFilterProps = {
      location,
      defaultField: 'name',
      fieldOption: [
        { value: 'name', name: 'Name' },
        { value: 'groups', name: 'Group' },
        { value: 'label', name: 'Label' },
        { value: 'type', name: 'Type' },
      ],
      onSearch(filter) {
        const { field: filterField, value: filterValue } = filter
        filterField && filterValue ? dispatch(routerRedux.push({
          pathname: '/recurringJob',
          search: queryString.stringify({
            ...queryString.parse(location.search),
            field: filterField,
            value: filterValue,
          }),
        })) : dispatch(routerRedux.push({
          pathname: '/recurringJob',
          search: queryString.stringify({}),
        }))
      },
    }

    const recurringJobBulkActionsProps = {
      selectedRows: this.state.selectedRows,
      deleteRecurringJob(record) {
        dispatch({
          type: 'recurringJob/bulkDelete',
          payload: record,
          callback: () => {
            me.setState({
              ...me.state,
              selectedRows: [],
            })
          },
        })
      },
    }

    return (
      <div className="content-inner" style={{ display: 'flex', flexDirection: 'column', overflow: 'visible !important' }}>
        <Row gutter={24} className="filter-input">
          <Col lg={{ span: 4 }} md={{ span: 6 }} sm={24} xs={24}>
            <RecurringJobBulkActions {...recurringJobBulkActionsProps} />
          </Col>
          <Col lg={{ offset: 13, span: 7 }} md={{ offset: 8, span: 10 }} sm={24} xs={24}>
            <Filter {...recurringJobFilterProps} />
          </Col>
        </Row>
        <Button className="out-container-button" size="large" type="primary" onClick={this.showCreateRecurringJobModal}>Create Recurring Job</Button>
        {this.state.createRecurringJobModalVisible && <CreateRecurringJob key={this.createRecurringJobModalKey} {...createRecurringJobModalProps} />}
        <RecurringJobList {...recurringJobListProps} />
      </div>
    )
  }
}

RecurringJob.propTypes = {
  recurringJob: PropTypes.object,
  loading: PropTypes.bool,
  location: PropTypes.object,
  dispatch: PropTypes.func,
}

export default connect(({ recurringJob, loading }) => ({ recurringJob, loading: loading.models.recurringJob }))(RecurringJob)
