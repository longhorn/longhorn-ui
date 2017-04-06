import React, { PropTypes } from 'react'
import { Form, Input, Button } from 'antd'
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
}) => {
  const handleOnSubmit = () => {
    const fields = getFieldsValue()
    onSubmit(fields)
  }
  const settings = data.map((item) => <FormItem key={item.id}>
    {getFieldDecorator(item.name, {
      initialValue: item.value,
    })(<Input addonBefore={item.name.humpToSpace()} />)}
  </FormItem>)

  return (
    <Form layout="horizontal" className={styles.setting}>
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
    </Form>
  )
}

form.propTypes = {
  form: PropTypes.object.isRequired,
  data: PropTypes.array,
  onSubmit: PropTypes.func,
  saving: PropTypes.bool,
}

export default Form.create()(form)
