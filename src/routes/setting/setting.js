import React from 'react'
import PropTypes from 'prop-types'
import ReactMarkdown from 'react-markdown/with-html'
import { Form, Input, Button, Spin, Checkbox, Select, InputNumber, Alert } from 'antd'
import styles from './setting.less'
import { classnames } from '../../utils'
import { LH_UI_VERSION } from '../../utils/constants'
import { safeParseJSON } from '../../utils/formatDate'

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

    // convert all values to string, bool as 'true'/'false'
    Object.keys(fields).forEach(key => {
      const fieldDef = data.find(d => d.definition.displayName === key)
      if (fieldDef?.definition?.type === 'bool') {
        fields[key] = fields[key] ? 'true' : 'false'
      } else {
        fields[key] = fields[key]?.toString() ?? ''
      }
    })

    // merge engine-specific fields into JSON string
    data.filter(d => d.definition.dataEngineSpecific).forEach(setting => {
      const engines = Object.keys(safeParseJSON(setting.value || setting.definition.default))
      if (engines.length > 0) {
        const merged = {}
        engines.forEach(engine => {
          const key = `${setting.id}-${engine}`
          if (fields[key] !== undefined) {
            merged[engine] = fields[key]
            delete fields[key]
          }
        })
        fields[setting.id] = JSON.stringify(merged)
      }
    })

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

  const genInputItem = (setting, onChangeFn) => {
    if (setting?.definition?.options) {
      return (
        <Select onChange={onChangeFn} getPopupContainer={triggerNode => triggerNode.parentElement}>
          {setting.definition.options.map((item, idx) => <Option key={idx} value={item}>{item}</Option>)}
        </Select>
      )
    }

    const commonProps = { disabled: setting.definition.readOnly, onChange: onChangeFn }
    switch (setting.definition.type) {
      case 'bool':
        return <Checkbox {...commonProps} onChange={e => onChangeFn(e.target.checked)} />
      case 'int':
        return <InputNumber {...commonProps} parser={limitNumber} min={0} />
      default:
        return <Input {...commonProps} />
    }
  }

  const genFormItem = (setting = {}) => {
    const { type, dataEngineSpecific: isEngineSpecific, displayName: fieldKey } = setting.definition
    const deprecated = type === 'deprecated'
    const engineValues = isEngineSpecific ? safeParseJSON(setting.value || setting.definition.default) : {}
    const engines = isEngineSpecific && Object.keys(engineValues).length ? Object.keys(engineValues) : [null]

    return (
      <FormItem
        key={setting.id}
        className="settings-container"
        style={{ display: deprecated ? 'none' : 'block' }}
      >
        <span
          className={setting.definition.required ? 'ant-form-item-required' : ''}
          style={{ fontSize: 14, fontWeight: 700, marginRight: 10 }}
        >
          {fieldKey}{type === 'bool' || type === 'int' ? ':' : ''}
        </span>

        {isEngineSpecific ? engines.map(engine => {
          const name = `${setting.id}-${engine}`
          const value = engineValues[engine]
          const onChangeFn = val => onInputChange(setting.id, { ...engineValues, [engine]: val })

          return (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className={styles.dataEngineLabel}>{`${engine.firstUpperCase()} Data Engine:`}</div>
              {getFieldDecorator(name, {
                rules: parseSettingRules(setting),
                initialValue: type === 'bool' ? value === 'true' || value === true : value,
                valuePropName: type === 'bool' ? 'checked' : 'value',
              })(genInputItem(setting, onChangeFn))}
            </div>
          )
        }) : (
          getFieldDecorator(setting.name, {
            rules: parseSettingRules(setting),
            initialValue: type === 'bool' ? setting.value === 'true' || setting.value === true : setting.value || setting.definition.default,
            valuePropName: type === 'bool' ? 'checked' : 'value',
          })(genInputItem(setting, val => onInputChange(fieldKey, val)))
        )}

        <small style={{ color: '#7f868d', fontSize: 13 }}>
          <ReactMarkdown className={styles.info} source={setting.definition.description} />
        </small>
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
