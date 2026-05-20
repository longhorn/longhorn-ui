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
  options,
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
      let urls = []
      if (items && items.length > 0) {
        items.forEach((ele) => {
          if (ele?.actions?.updateSnapshotDataIntegrity) {
            urls.push(ele.actions.updateSnapshotDataIntegrity)
          }
        })
      }

      onOk(data, urls)
    })
  }

  const modalOpts = {
    title: t('updateSnapshotDataIntegrityModal.title.snapshotDataIntegrity'),
    visible,
    onCancel,
    onOk: handleOk,
  }
  if (!items) {
    return null
  }
  return (
    <ModalBlur {...modalOpts}>
      <Form layout="horizontal">
        <FormItem label={t('updateSnapshotDataIntegrityModal.form.option.label')} {...formItemLayout}>
          {getFieldDecorator('snapshotDataIntegrity', {
            initialValue: 'disabled',
          })(<Select>
          { options.map(option => <Option key={option.key} value={option.value}>{option.key}</Option>) }
          </Select>)}
          <Alert
            style={{ marginTop: 10 }}
            message={t('updateSnapshotDataIntegrityModal.form.warning.message')}
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
  options: PropTypes.array,
  onCancel: PropTypes.func,
  items: PropTypes.array,
  onOk: PropTypes.func,
  t: PropTypes.func.isRequired,
}

export default withTranslation()(Form.create()(modal))
