import React from 'react'
import PropTypes from 'prop-types'
import { Form, Select } from 'antd'
import { groupBy } from './helper'
import { ModalBlur } from '../../components'
import { withTranslation } from 'react-i18next'

const FormItem = Form.Item
const { Option } = Select

const formItemLayout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 16,
  },
}

const modal = ({
  items,
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
      let actionUrls = []

      if (items && items.length > 0) {
        items.forEach((ele) => {
          if (ele.actions && ele.actions.updateReplicaAutoBalance) {
            actionUrls.push(ele.actions.updateReplicaAutoBalance)
          }
        })
      }

      onOk(data, actionUrls)
    })
  }

  const modalOpts = {
    title: t('updateReplicaAutoBalanceModal.title'),
    visible,
    onCancel,
    width: 710,
    onOk: handleOk,
  }
  if (items.length < 0) {
    return null
  }
  let initialValue = 'ignored'

  if (items.length === 1) {
    initialValue = items[0].replicaAutoBalance
  } else {
    let obj = groupBy(items, 'replicaAutoBalance') || {}

    if (Object.keys(obj) && Object.keys(obj).length === 1) {
      initialValue = Object.keys(obj)[0]
    }
  }

  return (
    <ModalBlur {...modalOpts}>
      <Form layout="horizontal">
        <FormItem label={t('updateReplicaAutoBalanceModal.fields.replicasAutoBalance')} {...formItemLayout}>
        {getFieldDecorator('replicaAutoBalance', {
          initialValue,
        })(<Select>
            <Option key={'ignored'} value={'ignored'}>{t('createVolume.options.ignored')}</Option>
            <Option key={'disabled'} value={'disabled'}>{t('createVolume.options.disabled')}</Option>
            <Option key={'least-effort'} value={'least-effort'}>{t('createVolume.options.leastEffort')}</Option>
            <Option key={'best-effort'} value={'best-effort'}>{t('createVolume.options.bestEffort')}</Option>
          </Select>)}
        </FormItem>
      </Form>
    </ModalBlur>
  )
}

modal.propTypes = {
  form: PropTypes.object.isRequired,
  visible: PropTypes.bool,
  onCancel: PropTypes.func,
  items: PropTypes.array,
  onOk: PropTypes.func,
  t: PropTypes.func,
}

export default Form.create()(withTranslation()(modal))
