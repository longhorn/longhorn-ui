import React, { PropTypes } from 'react'
import { Form, Input, Button, Spin, Icon } from 'antd'
import styles from './setting.less'
const FormItem = Form.Item

const form = ({
  form: {
  getFieldDecorator,
  getFieldsValue,
  },
  data,
  saving,
  onSubmit,
  loading,
}) => {
  const handleOnSubmit = () => {
    const fields = getFieldsValue()
    onSubmit(fields)
  }

  const parseSettingRules = (setting) => {
    const definition = setting.definition
    const rules = []
    if (definition.required) {
      rules.push({ required: true })
    }
    return rules
  }

  const settings = data.map((item) => <FormItem key={item.id} label={<span style={{ fontSize: '14px' }}>{item.definition.displayName}</span>} >
    {getFieldDecorator(item.name, {
      rules: parseSettingRules(item),
      initialValue: item.value || item.definition.default,
    })(<Input disabled={item.definition.readOnly} />)
    }
    <Icon type="question-circle-o" /> &nbsp;<small style={{ color: '#6c757d', fontSize: '80%', fontWeight: 400 }}>{item.definition.required ? 'Required. ' : ''} {item.definition.description}</small>
  </FormItem>)

  return (
    <Spin spinning={loading}>
      {loading ? <div></div> : <Form layout="horizontal" className={styles.setting}>
        {settings}
        <FormItem style={{ textAlign: 'center' }}>
          <Button
            onClick={handleOnSubmit}
            loading={saving}
            type="primary"
            htmlType="submit">
            Save
          </Button>
        </FormItem>
      </Form>}
    </Spin>
  )
}

form.propTypes = {
  form: PropTypes.object.isRequired,
  data: PropTypes.array,
  onSubmit: PropTypes.func,
  saving: PropTypes.bool,
  loading: PropTypes.bool,
}

export default Form.create()(form)
