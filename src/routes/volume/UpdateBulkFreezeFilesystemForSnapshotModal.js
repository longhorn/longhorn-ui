import React from 'react'
import PropTypes from 'prop-types'
import { Form, Select, Alert } from 'antd'
import { ModalBlur } from '../../components'
import { withTranslation } from 'react-i18next'

const FormItem = Form.Item
const { Option } = Select

const formItemLayout = {
  labelCol: {
    span: 24,
  },
  wrapperCol: {
    span: 24,
  },
}

const modal = ({
  items,
  option,
  visible,
  onCancel,
  onOk,
  form: {
    getFieldDecorator,
    validateFields,
    getFieldsValue,
  },
  t,
}) => {
  function handleOk() {
    validateFields((errors) => {
      if (errors) {
        return
      }
      const data = {
        ...getFieldsValue(),
      }
      const urls = items.map((item) => item?.actions?.updateFreezeFilesystemForSnapshot)

      onOk(data, urls)
    })
  }

  const modalOpts = {
    title: t('updateFreezeFilesystemForSnapshotModal.title.updateFreezeFilesystemForSnapshot'),
    visible,
    onCancel,
    width: 600,
    onOk: handleOk,
  }
  if (!items || items?.length === 0) {
    return null
  }
  return (
    <ModalBlur {...modalOpts}>
      <Form layout="horizontal">
        <FormItem label={t('updateFreezeFilesystemForSnapshotModal.form.option.label')} {...formItemLayout}>
          {getFieldDecorator('freezeFilesystemForSnapshot', {
            initialValue: 'ignored',
          })(<Select>
          { option.map(ele => <Option key={ele.key} value={ele.value}>{ele.key}</Option>) }
          </Select>)}
          <Alert
            style={{ marginTop: 10 }}
            message={t('updateFreezeFilesystemForSnapshotModal.form.warning.message')}
            type="warning"
          />
        </FormItem>
      </Form>
    </ModalBlur>
  )
}

modal.propTypes = {
  form: PropTypes.object.isRequired,
  visible: PropTypes.bool,
  option: PropTypes.array,
  onCancel: PropTypes.func,
  items: PropTypes.array,
  onOk: PropTypes.func,
  t: PropTypes.func.isRequired,
}

export default withTranslation()(Form.create()(modal))
