import React from 'react'
import PropTypes from 'prop-types'
import { AutoComplete } from 'antd'

const { Option } = AutoComplete

class Complete extends React.Component {
  state = {
    result: [],
  };

  handleSearch = value => {
    let result = this.props.options.filter((option) => {
      return option.includes(value) && value
    })
    if (!result) result = []
    this.setState({ result })
  };

  render() {
    const { result } = this.state
    const children = result.map(item => <Option key={item}>{item}</Option>)
    return (
      <AutoComplete style={{ width: '100%' }} onChange={this.props.autoCompleteChange} onSearch={this.handleSearch} placeholder="Volume Name">
        {children}
      </AutoComplete>
    )
  }
}

Complete.propTypes = {
  options: PropTypes.array,
  autoCompleteChange: PropTypes.func,
}

export default Complete
