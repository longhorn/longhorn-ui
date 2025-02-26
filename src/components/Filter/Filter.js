import React from 'react'
import PropTypes from 'prop-types'
import { Select, Input, Button, Form, Popover } from 'antd'
import queryString from 'query-string'
import styles from './Filter.less'

const Option = Select.Option

class Filter extends React.Component {
  constructor(props) {
    super(props)
    const {
      field = props.defaultField || 'Name',
      value = '',
      stateValue = '',
      nodeRedundancyValue = '',
      engineImageUpgradableValue = '',
      scheduleValue = '',
      pvStatusValue = '',
      revisionCounterValue = '',
      isGroupValue = '',
      createdFromValue = '',
    } = queryString.parse(props.location.search)

    this.state = {
      field,
      stateValue,
      value,
      nodeRedundancyValue,
      engineImageUpgradableValue,
      scheduleValue,
      pvStatusValue,
      revisionCounterValue,
      isGroupValue,
      keyword: value,
      createdFromValue,
    }
  }

  handleSubmit = () => {
    if (this.props.onSearch) {
      this.setState(
        (prevState) => ({ value: prevState.value.trim() }),
        () => this.props.onSearch({ ...this.state })
      )
    }
  }

  handleStatusChange = (stateValue) => {
    this.setState({ ...this.state, stateValue })
  }

  handleValueChange = (event) => {
    event.persist()
    this.setState({ ...this.state, value: event.target.value })
  }

  handleNodeRedundancyValueChange = (nodeRedundancyValue) => {
    this.setState({ ...this.state, nodeRedundancyValue })
  }

  handleEngineImageUpgradableValueChange = (engineImageUpgradableValue) => {
    this.setState({ ...this.state, engineImageUpgradableValue })
  }

  handleScheduleValueChange = (scheduleValue) => {
    this.setState({ ...this.state, scheduleValue })
  }

  handlePvStatusValueChange = (pvStatusValue) => {
    this.setState({ ...this.state, pvStatusValue })
  }

  handleRevisionCounterValueChange = (revisionCounterValue) => {
    this.setState({ ...this.state, revisionCounterValue })
  }

  handleIsGroupValueChange = (isGroupValue) => {
    this.setState({ ...this.state, isGroupValue })
  }

  handleAvailableValueChange = (availValue) => {
    this.setState({ ...this.state, value: availValue })
  }

  handleCreatedFromValueChange = (createdFromValue) => {
    this.setState({ ...this.state, value: createdFromValue })
  }

  handleFieldChange = (field) => {
    this.setState({ ...this.state, field })
  }

  render() {
    const {
      field = this.props.defaultField || 'Name',
      value = '',
      stateValue = '',
      nodeRedundancyValue = '',
      engineImageUpgradableValue = '',
      scheduleValue = '',
      pvStatusValue = '',
      revisionCounterValue = '',
      isGroup = '',
    } = queryString.parse(this.props.location.search)

    let defaultContent = {
      field,
      stateValue,
      value,
      nodeRedundancyValue,
      engineImageUpgradableValue,
      scheduleValue,
      pvStatusValue,
      revisionCounterValue,
      isGroup,
    }

    let valueForm = (
      <Input
        style={{ width: '100%' }}
        allowClear
        size="small"
        value={this.state.value}
        defaultValue={this.state.value}
        onChange={this.handleValueChange}
      />
    )

    if (this.state.field === 'status' && this.props.stateOption) {
      valueForm = (<Select key="status"
        style={{ width: '100%' }}
        size="large"
        allowClear
        defaultValue={this.state.stateValue}
        onChange={this.handleStatusChange}
      >
      {this.props.stateOption.map(item => (<Option key={item.value} value={item.value}>{item.name}</Option>))}
      </Select>)
    } else if (this.state.field === 'replicaNodeRedundancy' && this.props.replicaNodeRedundancyOption) {
      valueForm = (<Select key="replicaNodeRedundancy"
        style={{ width: '100%' }}
        size="large"
        allowClear
        defaultValue={this.state.nodeRedundancyValue}
        onChange={this.handleNodeRedundancyValueChange}
    >
    {this.props.replicaNodeRedundancyOption.map(item => (<Option key={item.value} value={item.value}>{item.name}</Option>))}
    </Select>)
    } else if (this.state.field === 'engineImageUpgradable' && this.props.engineImageUpgradableOption) {
      valueForm = (<Select key="engineImageUpgradable"
        style={{ width: '100%' }}
        size="large"
        allowClear
        defaultValue={this.state.scheduleValue}
        onChange={this.handleEngineImageUpgradableValueChange}
    >
    {this.props.engineImageUpgradableOption.map(item => (<Option key={item.value} value={item.value}>{item.name}</Option>))}
    </Select>)
    } else if (this.state.field === 'schedule' && this.props.scheduleOption) {
      valueForm = (<Select key="schedule"
        style={{ width: '100%' }}
        size="large"
        allowClear
        defaultValue={this.state.scheduleValue}
        onChange={this.handleScheduleValueChange}
    >
    {this.props.scheduleOption.map(item => (<Option key={item.value} value={item.value}>{item.name}</Option>))}
    </Select>)
    } else if (this.state.field === 'pvStatus' && this.props.pvStatusOption) {
      valueForm = (<Select key="pvStatus"
        style={{ width: '100%' }}
        size="large"
        allowClear
        defaultValue={this.state.pvStatusValue}
        onChange={this.handlePvStatusValueChange}
    >
    {this.props.pvStatusOption.map(item => (<Option key={item.value} value={item.value}>{item.name}</Option>))}
    </Select>)
    } else if (this.state.field === 'revisionCounter' && this.props.revisionCounterOption) {
      valueForm = (<Select key="revisionCounter"
        style={{ width: '100%' }}
        size="large"
        allowClear
        defaultValue={this.state.revisionCounterValue}
        onChange={this.handleRevisionCounterValueChange}
    >
    {this.props.revisionCounterOption.map(item => (<Option key={item.value} value={item.value}>{item.name}</Option>))}
    </Select>)
    } else if (this.state.field === 'sourceType' && this.props.createdFromOption) {
      valueForm = (
        <Select key="sourceType"
          style={{ width: '100%' }}
          size="large"
          allowClear
          defaultValue={this.state.createdFromValue}
          onChange={this.handleCreatedFromValueChange}
        >
          {this.props.createdFromOption.map(item => (<Option key={item.value} value={item.value}>{item.name}</Option>))}
        </Select>
      )
    } else if (this.state.field === 'available' && this.props.availableOption) {
      valueForm = (
        <Select
          key="available"
          style={{ width: '100%' }}
          size="large"
          allowClear
          onChange={this.handleAvailableValueChange}
        >
          {this.props.availableOption.map(item => (<Option key={item.name} value={item.value}>{item.name}</Option>))}
        </Select>
      )
    }

    let content = ''
    let popoverVisible = false

    for (let key in defaultContent) {
      if (defaultContent[key] !== '' && key !== 'field' && this.state[key] !== defaultContent[key]) {
        content = (<div style={{ maxWidth: '200px', wordBreak: 'break-word' }}>{`Current Filter: ${defaultContent[key]}`}</div>)
        popoverVisible = true
      }
    }

    return (
      <Form>
        <Input.Group compact className={styles.filter}>
          <Popover placement="topLeft" content={content} visible={popoverVisible}>
            <Select size="large" defaultValue={this.state.field} className={styles.filterSelect} onChange={this.handleFieldChange}>
              {this.props.fieldOption.map(item => (<Option key={item.value} value={item.value}>{item.name}</Option>))}
            </Select>
          </Popover>
          { valueForm }
          <Button size="large" style={{ height: '36px' }} htmlType="submit" type="primary" onClick={this.handleSubmit}>Go</Button>
        </Input.Group>
      </Form>
    )
  }
}

Filter.propTypes = {
  onSearch: PropTypes.func,
  form: PropTypes.object,
  location: PropTypes.object,
  stateOption: PropTypes.array,
  fieldOption: PropTypes.array,
  defaultField: PropTypes.string,
  booleanFields: PropTypes.array,
  scheduleOption: PropTypes.array,
  replicaNodeRedundancyOption: PropTypes.array,
  engineImageUpgradableOption: PropTypes.array,
  pvStatusOption: PropTypes.array,
  revisionCounterOption: PropTypes.array,
  recurringJobIsGroupOption: PropTypes.array,
  createdFromOption: PropTypes.array,
  availableOption: PropTypes.array,
}

export default Filter
