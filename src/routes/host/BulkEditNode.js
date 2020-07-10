import React from 'react'
import PropTypes from 'prop-types'
import { Form, Radio } from 'antd'
import { ModalBlur } from '../../components'
import styles from './BulkEditNode.less'

const FormItem = Form.Item
const RadioGroup = Radio.Group

const modal = ({
  form,
  visible,
  onCancel,
  onOk,
}) => {
  function handleOk() {
    const { validateFields } = form

    validateFields((errors, values) => {
      if (!errors) {
        onOk(values.nodeAllowScheduling)
      }
    })
  }

  const { getFieldDecorator } = form

  const modalOpts = {
    title: 'Edit Node',
    visible,
    onCancel,
    onOk: handleOk,
    width: 500,
    okText: 'Save',
  }

  return (
    <ModalBlur {...modalOpts}>
      <Form>
        <div className={styles.formItem} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div className={styles.label}>
            Node Scheduling
          </div>
          <div className={styles.control} style={{ width: '210px' }}>
            <FormItem style={{ margin: '3px 0px 0px 0px' }}>
              {getFieldDecorator('nodeAllowScheduling', {
                initialValue: 'noOperation',
              })(
                <RadioGroup>
                  <Radio value>Enable</Radio>
                  <Radio value={false}>Disable</Radio>
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
  form: PropTypes.object.isRequired,
  visible: PropTypes.bool,
  onCancel: PropTypes.func,
  onOk: PropTypes.func,
}

export default Form.create()(modal)
