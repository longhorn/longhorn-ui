import React from 'react'
import PropTypes from 'prop-types'
import { Input } from 'antd'

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

  triggerChange = (changedValue) => {
    const onChange = this.props.onChange
    if (onChange) {
      onChange(changedValue)
    }
  }

  render() {
    const state = this.state
    return (
      <Input
        placeholder={this.props.placeholder}
        readOnly={this.props.readOnly}
        type="text"
        size="large"
        onChange={this.handleValueChange}
        value={state.value}
      />
    )
  }
}

PathInput.propTypes = {
  value: PropTypes.string,
  defaultValue: PropTypes.string,
  placeholder: PropTypes.string,
  readOnly: PropTypes.bool,
  diskTypeIsFilesystem: PropTypes.bool,
  onChange: PropTypes.func,
}

export default PathInput
