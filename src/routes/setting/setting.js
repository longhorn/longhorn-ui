import React from 'react'
import PropTypes from 'prop-types'
import ReactMarkdown from 'react-markdown/with-html'
import { Form, Input, Button, Spin, Icon, Checkbox, Select, InputNumber, Alert } from 'antd'
import styles from './setting.less'
import { classnames } from '../../utils'
import { LH_UI_VERSION } from '../../utils/constants'

const FormItem = Form.Item
const { Option } = Select

const form = ({
  form: {
    getFieldDecorator,
    getFieldsValue,
  },
  data,
  saving,
  loading,
  onSubmit,
  onInputChange,
  resetChangedSettings,
}) => {
  const unAppliedDangerZoneSettings = data?.filter(d => d.definition.category === 'danger Zone' && d.applied === false).map(d => d.definition.displayName) || []

  const handleOnSubmit = () => {
    const fields = getFieldsValue()
    Object.keys(fields).forEach(key => { fields[key] = fields[key].toString() })
    onSubmit(fields)
    resetChangedSettings()
  }

  const parseSettingRules = (setting) => {
    const definition = setting.definition
    const rules = []
    if (definition.required && !definition.readOnly) {
      rules.push({ required: true })
    }
    return rules
  }

  const limitNumber = value => {
    if (typeof value === 'string') {
      return !isNaN(Number(value)) ? value.replace(/[^\d]/g, '') : ''
    } else if (typeof value === 'number') {
      return !isNaN(value) ? String(value).replace(/[^\d]/g, '') : ''
    } else {
      return ''
    }
  }

  const genInputItem = (setting) => {
    const settingType = setting.definition.type
    const settingName = setting.definition.displayName

    if (setting.definition && setting.definition.options) {
      return (
        <Select onChange={value => onInputChange(settingName, value)} getPopupContainer={triggerNode => triggerNode.parentElement}>
          {setting.definition.options.map((item, index) => (
            <Option key={index} value={item}>{item}</Option>
          ))}
        </Select>
      )
    }

    switch (settingType) {
      case 'bool':
        return (<Checkbox disabled={setting.definition.readOnly} onChange={e => onInputChange(settingName, e.target.checked)} />)
      case 'int':
        return (<InputNumber onChange={value => onInputChange(settingName, value)} style={{ width: '100%' }} parser={limitNumber} disabled={setting.definition.readOnly} min={0} />)
      default:
        return (<Input readOnly={setting.definition.readOnly} onChange={e => onInputChange(settingName, e.target.value)} />)
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
      case 'int':
        if (setting.value !== '') {
          initialValue = parseInt(setting.value, 10)
        } else {
          initialValue = 0
        }
        valuePropName = 'value'
        break
      default:
        initialValue = setting.value || setting.definition.default
        valuePropName = 'value'
        break
    }

    const deprecatedSettings = setting.definition && setting.definition.type === 'deprecated'
    return (
      <FormItem key={setting.id} className={'settings-container'} style={{ display: deprecatedSettings ? 'none' : 'block' }}>
        <span className={setting.definition.required ? 'ant-form-item-required' : ''} style={{ fontSize: '14px', fontWeight: 700, marginRight: '10px' }}>{setting.definition.displayName}{valuePropName === 'checked' ? ':' : ''}</span>
        {getFieldDecorator(setting.name, {
          rules: parseSettingRules(setting),
          initialValue,
          valuePropName,
        })(genInputItem(setting))}
        <div>
          {setting.definition.required && !setting.definition.readOnly
            ? <Icon style={{ marginRight: 5 }} type="question-circle-o" />
            : <Icon style={{ margin: '8px 5px 0px 0px', float: 'left' }} type="question-circle-o" />
          }
          <small style={{ color: '#6c757d', fontSize: '13px', fontWeight: 400 }}>
            {setting.definition.required && !setting.definition.readOnly ? 'Required. ' : ''}
            <ReactMarkdown source={setting.definition.description} />
          </small>
        </div>
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
      case 'danger Zone':
        return 3
      default:
        return 0
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
    return categoryA - categoryB
  }).map(item => (
    <div key={item}>
      <div className={classnames(styles.fieldset, { [styles.dangerZone]: item === 'danger Zone' })}>
        <span className={styles.fieldsetLabel}>{item}</span>
        {item === 'danger Zone' && (
          <Alert
            style={{ marginBottom: '1rem', marginTop: '1rem' }}
            message={
            <div className={styles.description}>
              <span>
              Some <a target="blank" href={`https://longhorn.io/docs/${LH_UI_VERSION}/references/settings/#danger-zone`}>Danger Zone settings</a> are not immediately applied when one or more volumes are still attached. Ensure that all volumes are detached before configuring the settings.
              </span>
              {unAppliedDangerZoneSettings.length > 0 && (
                <>
                  <br />
                  <br />
                  The following {unAppliedDangerZoneSettings.length === 1 ? 'setting has not' : 'settings have not'} been applied:
                  <ul>
                    {unAppliedDangerZoneSettings.map(settingName => <li key={settingName}>{settingName}</li>)}
                  </ul>
                </>
              )}
            </div>
            }
            type="error"
          />
        )}
        {settingsGrouped[item].map(setting => genFormItem(setting))}
      </div>
    </div>
  ))

  return (
    <Spin spinning={saving || loading} style={{ height: '100vh' }}>
      <div className={styles.wrapper}>
        <Form className={styles.setting}>
          {settings}
        </Form>
        {settings.length > 0 && (
            <div style={{ textAlign: 'center', position: 'sticky', marginTop: '1rem' }}>
              <Button
                onClick={handleOnSubmit}
                loading={saving}
                type="primary"
                htmlType="submit"
              >
                Save
              </Button>
            </div>
        )}
       </div>
    </Spin>
  )
}

form.propTypes = {
  form: PropTypes.object.isRequired,
  data: PropTypes.array,
  onSubmit: PropTypes.func,
  saving: PropTypes.bool,
  loading: PropTypes.bool,
  onInputChange: PropTypes.func,
  resetChangedSettings: PropTypes.func,
}

export default Form.create()(form)
