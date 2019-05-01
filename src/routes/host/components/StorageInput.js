import React from 'react'
import PropTypes from 'prop-types'
import { Input } from 'antd'


class StorageInput extends React.Component {
  constructor(props) {
    super(props)
    const value = props.value || props.defaultValue || 0
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
    const reg = /^(0|[1-9][0-9]*)(\.[0-9]*)?$/
    const value = e.target.value
    if ((!isNaN(value) && reg.test(value)) || value === '') {
      if (!('value' in this.props)) {
        this.setState({ value })
      }
      this.triggerChange({ value })
    }
  }

  triggerChange = (changedValue) => {
    const onChange = this.props.onChange
    if (onChange) {
      onChange(Object.assign({}, this.state, changedValue))
    }
  }

  render() {
    const { readOnly } = this.props
    const state = this.state
    return (
      <Input size="large" addonAfter="Gi" onChange={this.handleValueChange} value={state.value} readOnly={readOnly} />
    )
  }
}

StorageInput.propTypes = {
  value: PropTypes.number,
  defaultValue: PropTypes.number,
  min: PropTypes.number,
  readOnly: PropTypes.bool,
  onChange: PropTypes.func,
}

export default StorageInput
