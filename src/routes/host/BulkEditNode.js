import React from 'react'
import PropTypes from 'prop-types'
import { Form, Radio } from 'antd'
import { ModalBlur } from '../../components'
import styles from './BulkEditNode.less'
import { withTranslation } from 'react-i18next'

const FormItem = Form.Item
const RadioGroup = Radio.Group

const modal = ({
  form,
  visible,
  onCancel,
  onOk,
  selectedHostRows,
  t
}) => {
  function handleOk() {
    const { validateFields } = form

    validateFields((errors, values) => {
      if (!errors) {
        onOk(values)
      }
    })
  }

  function groupBy(objectArray, property) {
    return objectArray.reduce((acc, obj) => {
      let key = obj[property]
      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push(obj)
      return acc
    }, {})
  }

  let initEvictionRequested = ''

  if (selectedHostRows.length === 1) {
    initEvictionRequested = selectedHostRows[0].evictionRequested
  } else {
    let obj = groupBy(selectedHostRows, 'evictionRequested') || {}

    if (Object.keys(obj) && Object.keys(obj).length === 1) {
      initEvictionRequested = Object.keys(obj)[0] === 'true'
    }
  }

  const isEnabled = selectedHostRows.every((item) => item.allowScheduling)

  const { getFieldDecorator } = form

  const modalOpts = {
    title: t('bulkEditNode.title'),
    visible,
    onCancel,
    onOk: handleOk,
    width: 500,
    okText: t('common.save'),
  }

  return (
    <ModalBlur {...modalOpts}>
      <Form style={{ display: 'flex' }}>
        <div className={styles.formItem} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'start' }}>
          <div className={styles.label}>
            {t('bulkEditNode.nodeScheduling')}
          </div>
          <div className={styles.control} style={{ width: '210px' }}>
            <FormItem style={{ margin: '3px 0px 0px 0px' }}>
              {getFieldDecorator('allowScheduling', {
                initialValue: isEnabled,
              })(
                <RadioGroup>
                  <Radio value={true}>{t('common.enable')}</Radio>
                  <Radio value={false}>{t('common.disable')}</Radio>
                </RadioGroup>
              )}
            </FormItem>
          </div>
        </div>
        <div className={styles.formItem} style={{ display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'start' }}>
          <div className={styles.label}>
            {t('bulkEditNode.evictionRequested')}
          </div>
          <div className={styles.control}>
            <FormItem style={{ margin: '3px 0px 0px 0px' }}>
              {getFieldDecorator('evictionRequested', {
                initialValue: initEvictionRequested,
                rules: [
                  {
                    required: true,
                    message: t('bulkEditNode.evictionRequired'),
                  },
                ],
              })(
                <RadioGroup>
                  <Radio value={true}>{t('common.true')}</Radio>
                  <Radio value={false}>{t('common.false')}</Radio>
                </RadioGroup>
              )}
            </FormItem>
          </div>
        </div>
      </Form>
    </ModalBlur>
  )
}

modal.propTypes = {
  t: PropTypes.func,
  form: PropTypes.object.isRequired,
  selectedHostRows: PropTypes.array,
  visible: PropTypes.bool,
  onCancel: PropTypes.func,
  onOk: PropTypes.func,
}

export default withTranslation()(Form.create()(modal))
