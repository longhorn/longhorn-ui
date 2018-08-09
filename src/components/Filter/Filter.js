import React, { PropTypes } from 'react'
import { Select, Input, Button, Form } from 'antd'
import styles from './Filter.less'

const Option = Select.Option

class Filter extends React.Component {
  constructor(props) {
    super(props)
    const { field = props.defaultField || 'name', value = '', stateValue = '' } = props.location.query
    this.state = {
      field,
      stateValue,
      value,
    }
  }

  handleSubmit = () => {
    if (this.props.onSearch) {
      this.props.onSearch(Object.assign({}, this.state))
    }
  }

  handleStatusChange = (stateValue) => {
    this.setState({ ...this.state, stateValue })
  }

  handleValueChange = (value) => {
    this.setState({ ...this.state, value })
  }

  handleFieldChange = (field) => {
    this.setState({ ...this.state, field })
  }

  render() {
    return (
      <Form>
      <Input.Group compact className={styles.filter}>
       <Select size="large" defaultValue={this.state.field} className={styles.filterSelect} onChange={this.handleFieldChange}>
         {this.props.fieldOption.map(item => (<Option key={item.value} value={item.value}>{item.name}</Option>))}
       </Select>
      {this.state.field === 'status' && this.props.stateOption ? (
        <Select key="status"
          style={{ width: '100%' }}
          size="large"
          allowClear
          defaultValue={this.state.stateValue}
          onChange={this.handleStatusChange}
      >
        {this.props.stateOption.map(item => (<Option key={item.value} value={item.value}>{item.name}</Option>))}
      </Select>
      ) : (
      <Select
        key="value"
        style={{ width: '100%' }}
        allowClear
        size="large"
        mode="combobox"
        value={this.state.value}
        defaultValue={this.state.value}
        notFoundContent=""
        defaultActiveFirstOption={false}
        showArrow={false}
        filterOption={false}
        onChange={this.handleValueChange}
      >
      </Select>
      )}
        <Button size="large" htmlType="submit" type="primary" onClick={this.handleSubmit}>Go</Button>
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
}

export default Filter
