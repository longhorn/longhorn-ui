import React from 'react'
import PropTypes from 'prop-types'
import ReactMarkdown from 'react-markdown/with-html'
import { Form, Input, Button, Spin, Icon, Checkbox, Select } from 'antd'
import styles from './setting.less'
import { classnames } from '../../utils'
const FormItem = Form.Item
const { Option } = Select

const form = ({
  form: {
    getFieldDecorator,
    getFieldsValue,
  },
  data,
  saving,
  onSubmit,
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
    if (setting.id === 'volume-attachment-recovery-policy') {
      return (<Select getPopupContainer={triggerNode => triggerNode.parentElement}>
        <Option value="wait">wait</Option>
        <Option value="never">never</Option>
        <Option value="immediate">immediate</Option>
      </Select>)
    }
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
      <FormItem key={setting.id} className={'settings-container'}>
        <span className={setting.definition.required ? 'ant-form-item-required' : ''} style={{ fontSize: '14px', fontWeight: 700, marginRight: '10px' }}>{setting.definition.displayName}{valuePropName === 'checked' ? ':' : ''}</span>
        {getFieldDecorator(setting.name, {
          rules: parseSettingRules(setting),
          initialValue,
          valuePropName,
        })(genInputItem(setting))}
        <div>{setting.definition.required && !setting.definition.readOnly ? <Icon style={{ mariginRight: 5 }} type="question-circle-o" /> : <Icon style={{ margin: '8px 5px 0px 0px', float: 'left' }} type="question-circle-o" />} <small style={{ color: '#6c757d', fontSize: '13px', fontWeight: 400 }}>{setting.definition.required && !setting.definition.readOnly ? 'Required. ' : ''}<ReactMarkdown source={setting.definition.description} /></small></div>
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
  }).map(item => <div key={item}> <div className={classnames(styles.fieldset, { [styles.dangerZone]: item === 'danger Zone' })}><span className={styles.fieldsetLabel}>{item}</span> { settingsGrouped[item].map(setting => genFormItem(setting))}</div></div>)

  return (
    <Spin spinning={saving}>
      {<Form className={styles.setting}>
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
