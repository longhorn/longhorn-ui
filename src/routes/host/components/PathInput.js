import React from 'react'
import PropTypes from 'prop-types'
import { Input } from 'antd'
import { formatPath } from '../helper/index'

class PathInput extends React.Component {
  constructor(props) {
    super(props)
    const value = props.value || props.defaultValue || ''
    this.state = {
      value,
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if ('value' in nextProps) {
      const value = nextProps.value
      this.setState({ value })
    }
  }

  handleValueChange = (e) => {
    const value = e.target.value
    if (!('value' in this.props)) {
      this.setState({ value })
    }
    this.triggerChange(value)
  }

  handleBlur = (e) => {
    const value = formatPath(e.target.value)
    this.triggerChange(value)
  }

  triggerChange = (changedValue) => {
    const onChange = this.props.onChange
    if (onChange) {
      onChange(changedValue)
    }
  }

  render() {
    const state = this.state
    return (
      <Input {...this.props} type="text" size="large" onBlur={this.handleBlur} onChange={this.handleValueChange} value={state.value} />
    )
  }
}

PathInput.propTypes = {
  value: PropTypes.string,
  defaultValue: PropTypes.string,
  onChange: PropTypes.func,
}

export default PathInput
