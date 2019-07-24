import React from 'react'
import PropTypes from 'prop-types'
import { Form, Input, Icon, Button } from 'antd'


class BackupLabelInputForRecurring extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      key: [],
      keys: [],
      value: [],
      id: 0,
    }
  }

  componentDidMount() {
    const { labelsProps } = this.props
    let i = 0
    let key = []
    let keys = []
    let value = []

    for (let item in labelsProps) {
      if (labelsProps[item]) {
        key.push(item)
        value.push(labelsProps[item])
        keys.push(i++)
      }
    }

    this.setState({
      key,
      keys,
      value,
      id: key.length ? key.length - 1 : 0,
    })
  }

  remove = k => {
    const { form } = this.props
    const keys = form.getFieldValue('keys')
    form.setFieldsValue({
      keys: keys.filter(key => key !== k),
    })
  }

  add = () => {
    const { form } = this.props
    const keys = form.getFieldValue('keys')
    let id = this.state.id
    const nextKeys = keys.concat(++id)
    this.setState({
      ...this.state,
      id,
    })
    form.setFieldsValue({
      keys: nextKeys,
    })
  }

  handleSubmit = e => {
    e.preventDefault()
  }

  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form
    const formItemLayoutWithOutLabel = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 16, offset: 4 },
      },
    }
    getFieldDecorator('keys', { initialValue: this.state.keys })
    const keys = getFieldValue('keys')
    const formItems = keys.map((k, index) => (
    <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'start', height: '60px' }} key={index}>
      <Form.Item
        required={false}
        key={`key${k}`}
        style={{ marginBottom: 0 }}
      >
        {getFieldDecorator(`key[${k}]`, {
          initialValue: this.state.key[k],
          validateTrigger: ['onChange', 'onBlur'],
          rules: [
            {
              required: true,
              whitespace: true,
              message: 'key is required',
            },
          ],
        })(<Input placeholder="Labels Key" style={{ marginRight: 8 }} />)}
      </Form.Item>
      <Form.Item
        required={false}
        key={`value${k}`}
        style={{ marginBottom: 0 }}
      >
        {getFieldDecorator(`value[${k}]`, {
          initialValue: this.state.value[k],
          validateTrigger: ['onChange', 'onBlur'],
          rules: [
            {
              required: true,
              whitespace: true,
              message: 'value is required',
            },
          ],
        })(<Input placeholder="Labels Value" style={{ marginRight: 8 }} />)}
      </Form.Item>{keys.length > 0 ? (
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
        <Form.Item style={{ marginBottom: '0px' }} {...formItemLayoutWithOutLabel}>
          <Button type="dashed" onClick={this.add} style={{ width: '100%' }}>
            <Icon type="plus" /> Add Labels for Backup
          </Button>
        </Form.Item>
      </Form>
    )
  }
}

BackupLabelInputForRecurring.propTypes = {
  form: PropTypes.object,
  labelsProps: PropTypes.object,
}

export default BackupLabelInputForRecurring
