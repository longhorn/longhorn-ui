import React from 'react'
import PropTypes from 'prop-types'
import { Card, Tabs, Button, Table, message, Icon, Tooltip, Modal } from 'antd'
import prettyCron from '../../../utils/prettycron'
import { ModalBlur } from '../../../components'
import CreateRecurringJob from './CreateRecurringJob'
import EditRecurringJob from '../../recurringJob/CreateRecurringJob'
import RecurringJobActions from './RecurringJobActions'
import AddRecurringJobOrGroupModal from './AddRecurringJobOrGroupModal'
import styles from './index.less'

const confirm = Modal.confirm

message.config({
  top: 60,
  duration: 5,
})

const { TabPane } = Tabs

class RecurringJob extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      selected: {},
      groupSelected: {},
      isEdit: false,
      selectedJobRows: [],
      selectedJobGroupRows: [],
      addRecurringJobModalVisible: false,
      addRecurringJobGroupModalVisible: false,
      editRecurringJobModalVisible: false,
      modalGroupDeatilVisible: false,
      editRecurringJobModalKey: Math.random(),
      addRecurringJobGroupModalKey: Math.random(),
      addRecurringJobModalKey: Math.random(),
      recurringJobGroupOptions: [],
      recurringExistingJobOptions: [],
      currentCron: '0 0 * * *',
      modalCronOpts: {
        visible: false,
      },
      ReactCronKey: Math.random(),
      modulerCronDisabled: false,
    }
  }

  componentDidMount() {
    this.props.dispatch({
      type: 'volume/queryVolumeRecurringJobList',
      payload: {
        ...this.props.selectedVolume,
      },
    })
  }

  onNewRecurringJob = () => {
    this.props.dispatch({
      type: 'volume/getRecurringJob',
      callback: (data) => {
        if (data) {
          let recurringExistingJobOptions = []
          let dataSourceRecurringJob = this.props.dataSource.filter((item) => {
            return !item.isGroup
          })
          // Extracts the group options
          data.forEach((item) => {
            if (!dataSourceRecurringJob.some((job) => {
              return job.name === item.name
            })) {
              recurringExistingJobOptions.push({
                id: item.name,
                name: item.name,
              })
            }
          })

          this.setState({
            ...this.state,
            isEdit: false,
            currentCron: '0 0 * * *',
            addRecurringJobModalVisible: true,
            addRecurringJobModalKey: Math.random(),
            recurringExistingJobOptions,
          })
        } else {
          message.error('Get Recurring Job failed')
        }
      },
    })
  }

  addJobGroupForVolume = () => {
    this.props.dispatch({
      type: 'volume/getRecurringJob',
      callback: (data) => {
        if (data) {
          let recurringJobGroupOptions = []
          let dataSourceRecurringJobGroup = this.props.dataSource.filter((item) => {
            return item.isGroup
          })
          // Extracts the group options
          data.forEach((item) => {
            if (item.groups && item.groups.length > 0) {
              item.groups.forEach((group) => {
                if (!recurringJobGroupOptions.some((option) => {
                  return option.name === group
                }) && !dataSourceRecurringJobGroup.some((job) => {
                  return job.name === group
                })) {
                  recurringJobGroupOptions.push({
                    id: group,
                    name: group,
                  })
                }
              })
            }
          })

          this.setState({
            ...this.state,
            addRecurringJobGroupModalVisible: true,
            addRecurringJobGroupModalKey: Math.random(),
            recurringJobGroupOptions,
          })
        } else {
          message.error('Get Recurring Job failed')
        }
      },
    })
  }

  // For cron modal start
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
  // cron modal end

  bulkDeleteJob = () => {
    let me = this
    confirm({
      width: 800,
      title: `Are you sure you want to remove Recurring Job ${this.state.selectedJobRows.map((item) => item.name).join(',')} from ${this.props.selectedVolume && this.props.selectedVolume.name}?`,
      onOk() {
        me.props.dispatch({
          type: 'volume/removeBulkVolumeRecurringJob',
          payload: {
            selectedVolume: me.props.selectedVolume,
            selectedJobRows: me.state.selectedJobRows,
            isGroup: false,
          },
          callback: () => {
            me.setState({
              ...me.state,
              selectedJobRows: [],
            })
          },
        })
      },
    })
  }

  bulkDeleteJobGroup = () => {
    let me = this
    confirm({
      width: 800,
      title: `Are you sure you want to remove Recurring Job Group ${this.state.selectedJobGroupRows.map((item) => item.name).join(',')} from ${this.props.selectedVolume && this.props.selectedVolume.name}?`,
      onOk() {
        me.props.dispatch({
          type: 'volume/removeBulkVolumeRecurringJob',
          payload: {
            selectedVolume: me.props.selectedVolume,
            selectedJobRows: me.state.selectedJobGroupRows,
            isGroup: true,
          },
          callback: () => {
            me.setState({
              ...me.state,
              selectedJobGroupRows: [],
            })
          },
        })
      },
    })
  }

  showModalGroupDeatil = (record) => {
    this.setState({
      ...this.state,
      modalGroupDeatilVisible: true,
      groupSelected: record,
    })
  }

  hideModalGroupDeatil = () => {
    this.setState({
      ...this.state,
      modalGroupDeatilVisible: false,
    })
  }

  render() {
    const me = this
    const { dispatch, selectedVolume, dataSource, recurringJobData } = this.props
    if (dataSource && dataSource.length > 0) {
      dataSource.sort((a, b) => a.name.localeCompare(b.name))
    }
    let dataSourceRecurringJob = dataSource.filter((item) => {
      return !item.isGroup
    })
    dataSourceRecurringJob = dataSourceRecurringJob && dataSourceRecurringJob.map((item) => {
      let recurringJob = recurringJobData.find((ele) => {
        return ele.name === item.name
      })
      if (recurringJob) {
        item.isAlreadyDeleted = false
        return Object.assign(item, recurringJob)
      } else {
        // If not found volume recurring Job in recurringJobs, Proof of deletion.
        item.isAlreadyDeleted = true
      }
      return item
    })
    const dataSourceRecurringJobGruop = dataSource.filter((item) => {
      return item.isGroup
    }).map((item) => {
      let recurringJob = recurringJobData.find((ele) => {
        return ele.groups && ele.groups.includes(item.name)
      })
      if (recurringJob) {
        item.isAlreadyDeleted = false
      } else {
        // If not found volume recurring Job in recurringJobs, Proof of deletion.
        item.isAlreadyDeleted = true
      }
      return item
    })
    const createRecurringJobModalProps = {
      item: {
        ...this.state.selected,
      },
      visible: this.state.addRecurringJobModalVisible,
      isEdit: this.state.isEdit,
      recurringJobOptions: this.state.recurringExistingJobOptions,
      addForVolume: true,
      onOk(newRecurringJob, isNew) {
        me.setState({
          ...me.state,
          addRecurringJobModalVisible: false,
        })
        if (isNew) {
          dispatch({
            type: 'volume/createRecurringJob',
            payload: {
              selectedVolume,
              recurringJob: newRecurringJob,
            },
          })
        } else {
          dispatch({
            type: 'volume/addExistingRecurringJobToVolume',
            payload: {
              selectedVolume,
              recurringJob: newRecurringJob,
            },
          })
        }
      },
      onCancel() {
        me.setState({
          ...me.state,
          addRecurringJobModalVisible: false,
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

    const editRecurringJobModalProps = {
      item: {
        ...this.state.selected,
      },
      visible: this.state.editRecurringJobModalVisible,
      isEdit: this.state.isEdit,
      addForVolume: true,
      onOk(newRecurringJob) {
        me.setState({
          ...me.state,
          currentCron: '0 0 * * *',
          editRecurringJobModalVisible: false,
        })
        dispatch({
          type: 'volume/updateRecurringJob',
          payload: {
            selectedVolume,
            recurringJob: newRecurringJob,
          },
        })
      },
      onCancel() {
        me.setState({
          ...me.state,
          editRecurringJobModalVisible: false,
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
    const recurringVolumeJobActionsProps = {
      deleteVolumeRecurringJob: (record) => {
        if (selectedVolume.actions && selectedVolume.actions.recurringJobDelete) {
          this.props.dispatch({
            type: 'volume/removeVolumeRecurringJob',
            payload: {
              selectedVolume,
              name: record.name,
              isGroup: record.isGroup,
            },
          })
        }
      },
      editRecurringJob: (record) => {
        me.setState({
          ...me.state,
          isEdit: true,
          selected: record,
          currentCron: record.cron,
          editRecurringJobModalVisible: true,
          editRecurringJobModalKey: Math.random(),
        })
      },
    }
    const addRecurringJobGroupModalProps = {
      item: {
        type: 'jobGroup',
        options: this.state.recurringJobGroupOptions,
      },
      visible: this.state.addRecurringJobGroupModalVisible,
      onOk(record) {
        me.setState({
          ...me.state,
          addRecurringJobGroupModalVisible: false,
        })
        dispatch({
          type: 'volume/addRecurringJobGroupToVolume',
          payload: {
            selectedVolume,
            recurringJobGroup: record,
          },
        })
      },
      onCancel() {
        me.setState({
          ...me.state,
          addRecurringJobGroupModalVisible: false,
        })
      },
    }
    const columnsForJob = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        width: 200,
        render: (text, record) => {
          return (
            <div>
              {record.name}
              {record.isAlreadyDeleted ? <Tooltip title={'Recurring Job doesn\'t exist'}><Icon className="faulted" style={{ marginLeft: 5 }} type="exclamation-circle" /></Tooltip> : ''}
            </div>
          )
        },
      }, {
        title: 'Type',
        dataIndex: 'task',
        key: 'task',
        width: 100,
        render: (text, record) => {
          return (
            <div>{record.task}</div>
          )
        },
      }, {
        title: 'Groups',
        dataIndex: 'groups',
        key: 'groups',
        width: 200,
        render: (text, record) => {
          return (
            <div>{record.groups && record.groups.join(', ')}</div>
          )
        },
      }, {
        title: 'Schedule',
        dataIndex: 'cron',
        key: 'cron',
        width: 200,
        render: (text, record) => {
          return (
            <div>
              {record.cron && prettyCron.toString(record.cron)}
            </div>
          )
        },
      }, {
        title: 'Labels',
        dataIndex: 'labels',
        key: 'labels',
        width: 200,
        render: (text, record) => {
          return (
            <div>{record.labels && Object.keys(record.labels).map((key) => {
              return key ? `${key}: ${record.labels[key]}` : ''
            }).join(', ')}</div>
          )
        },
      }, {
        title: 'Retain',
        key: 'retain',
        width: 120,
        render: (record) => {
          return (
            <div>{record.retain}</div>
          )
        },
      }, {
        title: 'Concurrency',
        key: 'concurrency',
        width: 120,
        render: (record) => {
          return (
            <div>{record.concurrency}</div>
          )
        },
      },
      {
        title: 'Operation',
        key: 'operation',
        fixed: 'right',
        width: 110,
        render: (text, record) => {
          return (
            <RecurringJobActions {...recurringVolumeJobActionsProps} selected={record} />
          )
        },
      },
    ]

    const recurringJobInGorupEle = () => {
      let dataSourceForExpandTable = []
      if (recurringJobData && recurringJobData.length > 0) {
        dataSourceForExpandTable = recurringJobData.filter((item) => {
          return item.groups && item.groups.includes(me.state.groupSelected.name)
        })
      }

      return <Table
        bordered={false}
        columns={columnsForJob.filter((column) => column.key !== 'operation')}
        dataSource={dataSourceForExpandTable || []}
        simple
        loading={this.props.loading}
        pagination={false}
        rowKey={row => row.id}
        height={`${220}px`}
        scroll={{ x: 600, y: 220 }}
      />
    }

    const columnsForJobGroup = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        width: '65%',
        render: (text, record) => {
          return (
            <div onClick={() => this.showModalGroupDeatil(record)} style={{ width: '100%', cursor: 'pointer' }}>
              <Button type={'link'}>{text}</Button>
              {record.isAlreadyDeleted ? <Tooltip title={record.name === 'default' ? 'No Recurring job is set to default Group' : 'Recurring Job Group doesn\'t exist'}><Icon className="faulted" style={{ marginLeft: 5 }} type="exclamation-circle" /></Tooltip> : ''}
            </div>
          )
        },
      },
      {
        title: 'Operation',
        key: 'operation',
        width: '33%',
        render: (text, record) => {
          return (
            <RecurringJobActions {...recurringVolumeJobActionsProps} isGroup={true} selected={record} />
          )
        },
      },
    ]
    const jobRowSelection = {
      selectedRowKeys: this.state.selectedJobRows.map(item => item.id),
      onChange(_, records) {
        me.setState({
          ...me.state,
          selectedJobRows: records,
        })
      },
    }
    const jobRowGroupSelection = {
      selectedRowKeys: this.state.selectedJobGroupRows.map(item => item.id),
      onChange(_, records) {
        me.setState({
          ...me.state,
          selectedJobGroupRows: records,
        })
      },
    }

    const modalGroupDeatilOpts = {
      visible: this.state.modalGroupDeatilVisible,
      title: 'Recurring Job',
      width: 1300,
      hasOnCancel: true,
      onOk: this.hideModalGroupDeatil,
      onCancel: this.hideModalGroupDeatil,
    }

    const canAddJobToVolume = selectedVolume.actions && selectedVolume.actions.recurringJobList && selectedVolume.actions.recurringJobAdd

    return (
      <Card
        title={
          <div className={styles.header}>
            <div>Recurring Jobs Schedule</div>
          </div>
        }
        bordered={false}
      >
        <Tabs className="recurring-jobs-tabs" tabPosition="left" type="card" defaultActiveKey="1">
          <TabPane tab="Job" key="1">
            <div className={styles.tabHeader}>
              <div>
                <Button type="primary" disabled={this.state.selectedJobRows && this.state.selectedJobRows.length === 0} onClick={() => this.bulkDeleteJob()}> Delete </Button>
              </div>
              <div className={styles.new}>
                <Button type="primary" onClick={this.onNewRecurringJob} disabled={!canAddJobToVolume} icon="plus">Add</Button>
              </div>
            </div>
            <div style={{ minHeight: '270px', maxHeight: '350' }}>
              <Table
                bordered={false}
                columns={columnsForJob}
                dataSource={dataSourceRecurringJob}
                rowSelection={jobRowSelection}
                simple
                loading={this.props.loading}
                pagination={false}
                rowKey={record => record.id}
                scroll={{ x: 750, y: 350 }}
              />
            </div>
            {this.state.addRecurringJobModalVisible && <CreateRecurringJob key={this.state.addRecurringJobModalKey} {...createRecurringJobModalProps} />}
            {this.state.editRecurringJobModalVisible && <EditRecurringJob key={this.state.editRecurringJobModalKey} {...editRecurringJobModalProps} />}
          </TabPane>
          <TabPane tab="Group" key="2">
            <div style={{ marginBottom: 5 }}>
            <div className={styles.tabHeader}>
              <div>
                <Button type="primary" disabled={this.state.selectedJobGroupRows && this.state.selectedJobGroupRows.length === 0} onClick={() => this.bulkDeleteJobGroup()}> Delete </Button>
              </div>
              <div className={styles.new}>
                <Button type="primary" onClick={this.addJobGroupForVolume} disabled={!canAddJobToVolume} icon="plus">Add</Button>
              </div>
            </div>
            </div>
            <div style={{ minHeight: '270px', maxHeight: '350' }}>
              <Table
                bordered={false}
                columns={columnsForJobGroup}
                dataSource={dataSourceRecurringJobGruop}
                rowSelection={jobRowGroupSelection}
                simple
                loading={this.props.loading}
                pagination={false}
                rowKey={record => record.id}
                scroll={{ x: 750, y: 350 }}
              />
            </div>
            <ModalBlur {...modalGroupDeatilOpts}>
              {recurringJobInGorupEle()}
            </ModalBlur>
            {this.state.addRecurringJobGroupModalVisible && <AddRecurringJobOrGroupModal key={this.addRecurringJobGroupModalKey} {...addRecurringJobGroupModalProps} />}
          </TabPane>
        </Tabs>
      </Card>
    )
  }
}

RecurringJob.propTypes = {
  selectedVolume: PropTypes.object,
  dataSource: PropTypes.array,
  recurringJobData: PropTypes.array,
  loading: PropTypes.bool,
  dispatch: PropTypes.func,
}

export default RecurringJob
