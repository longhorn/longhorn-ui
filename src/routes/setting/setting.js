import React, { PropTypes } from 'react'
import { Form, Input, Button, Spin, Icon, Checkbox } from 'antd'
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
    Object.keys(fields).forEach(key => { fields[key] = fields[key].toString() })
    onSubmit(fields)
  }
  const parseSettingRules = (setting) => {
    const definition = setting.definition
    const rules = []
    if (definition.required && !definition.readOnly) {
      rules.push({ required: true })
    }
    return rules
  }
  const genInputItem = (setting) => {
    switch (setting.definition.type) {
      case 'bool':
        return (<Checkbox disabled={setting.definition.readOnly} />)
      default:
        return (<Input readOnly={setting.definition.readOnly} checked={setting.value} />)
    }
  }
  const genFormItem = (setting) => {
    let initialValue
    let valuePropName
    switch (setting.definition.type) {
      case 'bool':
        if (setting.value !== '') {
          initialValue = setting.value === 'true'
        } else {
          initialValue = setting.definition.default === 'true'
        }
        valuePropName = 'checked'
        break
      default:
        initialValue = setting.value || setting.definition.default
        valuePropName = 'value'
        break
    }
    return (
      <FormItem key={setting.id} label={<span style={{ fontSize: '14px' }}>{setting.definition.displayName}</span>} >
        {getFieldDecorator(setting.name, {
          rules: parseSettingRules(setting),
          initialValue,
          valuePropName,
        })(genInputItem(setting))
        }
        <Icon type="question-circle-o" /> &nbsp;<small style={{ color: '#6c757d', fontSize: '13px', fontWeight: 400 }}>{setting.definition.required && !setting.definition.readOnly ? 'Required. ' : ''}{setting.definition.description}</small>
      </FormItem>
    )
  }
  const getCategoryWeight = (category) => {
    switch (category) {
      case 'general':
        return 0
      case 'backup':
        return 1
      case 'scheduling':
        return 2
      default:
        return category
    }
  }
  const settingsGrouped = data.reduce((result, item) => {
    const r = result[item.definition.category]
    if (r) {
      r.push(item)
    } else {
      result[item.definition.category] = [item]
    }
    return result
  }, {})
  const settings = Object.keys(settingsGrouped).sort((a, b) => {
    const categoryA = getCategoryWeight(a)
    const categoryB = getCategoryWeight(b)
    if (categoryA < categoryB) {
      return -1
    }
    if (categoryA > categoryB) {
      return 1
    }
    return 0
  }).map(item => <div key={item}> <div className={styles.fieldset}><span className={styles.fieldsetLabel}>{item}</span> { settingsGrouped[item].map(setting => genFormItem(setting))}</div></div>)

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
