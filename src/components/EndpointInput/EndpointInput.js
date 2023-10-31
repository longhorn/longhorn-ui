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
    const { tlsSecrets } = this.props

    return (
      <div style={{ display: 'flex' }}>
        <FormItem label="Domain Name" style={{ flex: 0.6 }} labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
          <Input placeholder={this.state.domainName} />
        </FormItem>

        <FormItem label="TLS Secret" style={{ flex: 0.6 }} labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
          <Select>
            {tlsSecrets.map((opt) => {
              return (<Option key={opt.name}>{opt.name}</Option>)
            })}
          </Select>
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
