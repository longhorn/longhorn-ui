import React from 'react'
import PropTypes from 'prop-types'
import styles from './Search.less'
import { Form, Select, Button, Space } from 'antd'

class Search extends React.Component {
  state = {
    value: '',
    options: [],
    selectValue: (this.props.select && this.props.selectProps) ? this.props.selectProps.defaultValue : '',
  }

  handleSearch = () => {
    const data = {
      keyword: this.state.value,
    }
    if (this.props.select) {
      data.field = this.state.selectValue
    }
    if (this.props.onSearch) this.props.onSearch(data)
  }

  handleInputChange = value => {
    let options = []
    const setting = this.props.selectOptions.find(s => s.value === this.state.selectValue)
    if (setting.options) {
      options = setting.options(value)
    }
    this.setState({
      ...this.state,
      value: value || '',
      options,
    })
  }

  handleSelectChange = value => {
    this.setState({
      ...this.state,
      selectValue: value,
    })
  }

  render() {
    const allowClear = true
    const { size, select, selectOptions, selectProps, style, keyword } = this.props
    return (
      <Form>
        <Space.Compact size={size} className={styles.search} style={style} onKeyPress={this.handleSearch}>
          {select && <Select className={styles.searchSelect} ref="searchSelect" onChange={this.handleSelectChange} size={size} {...selectProps}>
            {selectOptions && selectOptions.map((item, key) => <Select.Option value={item.value} key={key}>{item.name || item.value}</Select.Option>)}
          </Select>}
          <Select size={size}
            allowClear={allowClear}
            style={{ width: '100%' }}
            mode="AutoComplete"
            onChange={this.handleInputChange}
            filterOption={false}
            onKeyPress={this.handleSearch}
            defaultValue={keyword}
          >
            {this.state.options}
          </Select>
          <Button htmlType="submit" size={size} type="primary" onClick={this.handleSearch}>Go</Button>
        </Space.Compact>
      </Form>
    )
  }
}

Search.propTypes = {
  size: PropTypes.string,
  select: PropTypes.bool,
  selectProps: PropTypes.object,
  onSearch: PropTypes.func,
  selectOptions: PropTypes.array,
  style: PropTypes.object,
  keyword: PropTypes.string,
}

export default Search
