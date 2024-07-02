import React from 'react'
import PropTypes from 'prop-types'
import { Form, Input, Icon, Button } from 'antd'

let id = 0

class BackupLabelInput extends React.Component {
  remove = k => {
    const { form } = this.props
    // can use data-binding to get
    const keys = form.getFieldValue('keys')
    // We need at least one passenger

    // can use data-binding to set
    form.setFieldsValue({
      keys: keys.filter(key => key !== k),
    })
  };

  add = () => {
    const { form } = this.props
    const keys = form.getFieldValue('keys')
    const nextKeys = keys.concat(id++)
    form.setFieldsValue({
      keys: nextKeys,
    })
  }

  handleSubmit = e => e.preventDefault()

  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form
    const formItemLayoutWithOutLabel = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 16, offset: 4 },
      },
    }
    getFieldDecorator('keys', { initialValue: [] })
    const keys = getFieldValue('keys')
    const formItems = keys.map((k, index) => (
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'start', height: '60px' }} key={index}>
        <Form.Item
          required={false}
          key={`key${k}`}
          labelCol={{ span: 4 }}
          style={{ marginBottom: 0 }}
        >
          {getFieldDecorator(`key[${k}]`, {
            validateTrigger: ['onChange', 'onBlur'],
            rules: [
              {
                required: true,
                whitespace: true,
                message: 'key is required',
              },
            ],
          })(<Input placeholder="Key" style={{ marginRight: 8 }} />)}
        </Form.Item>
        <Form.Item
          required={false}
          key={`value${k}`}
          style={{ marginBottom: 0 }}
        >
          {getFieldDecorator(`value[${k}]`, {
            validateTrigger: ['onChange', 'onBlur'],
            rules: [
              {
                required: true,
                whitespace: true,
                message: 'value is required',
              },
            ],
          })(<Input placeholder="Value" style={{ marginRight: 8 }} />)}
        </Form.Item>
        {keys.length > 0 ? (
          <Icon
            style={{ marginTop: '12px' }}
            className="dynamic-delete-button"
            type="minus-circle-o"
            onClick={() => this.remove(k)}
          />) : null}
      </div>
    ))
    return (
      <Form onSubmit={this.handleSubmit}>
        {formItems}
        <Form.Item {...formItemLayoutWithOutLabel}>
          <Button type="dashed" onClick={this.add} style={{ width: '100%' }}>
            <Icon type="plus" /> Add Backup Labels
          </Button>
        </Form.Item>
      </Form>
    )
  }
}

BackupLabelInput.propTypes = {
  form: PropTypes.object,
}

export default BackupLabelInput
