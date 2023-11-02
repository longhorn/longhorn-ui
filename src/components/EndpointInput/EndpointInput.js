import React from 'react'
import PropTypes from 'prop-types'
import { Form, Select, Input } from 'antd'

const FormItem = Form.Item
const Option = Select.Option

class EndpointInput extends React.Component {
  state = {
    domainName: 'example.com',
    tlsSecret: '',
  }

  render() {
    const { getFieldDecorator, getFieldsValue, setFieldsValue } = this.props
    const { tlsSecrets } = this.props

    function secretSelect(value) {
      setFieldsValue({
        ...getFieldsValue(),
        tlsSecret: value,
      })
    }

    return (
      <div style={{ display: 'flex' }}>
        <FormItem label="Domain Name" style={{ flex: 0.6 }} labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
          {getFieldDecorator('domainName', {})(<Input placeholder={this.state.domainName} />)}
        </FormItem>

        <FormItem label="TLS Secret" style={{ flex: 0.6 }} labelCol={{ span: 8 }} apperCol={{ span: 14 }}>
          {getFieldDecorator('tlsSecret', {})(
            <Select onChange={secretSelect}>
              {tlsSecrets.map((opt) => {
                return (<Option key={opt.name}>{opt.name}</Option>)
              })}
            </Select>
          )}
        </FormItem>
      </div>
    )
  }
}

EndpointInput.propTypes = {
  state: PropTypes.object,
  tlsSecrets: PropTypes.array,
  getFieldDecorator: PropTypes.func,
  getFieldsValue: PropTypes.func,
  setFieldsValue: PropTypes.func,
}

export default EndpointInput
