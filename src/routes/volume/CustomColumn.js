import React from 'react'
import PropTypes from 'prop-types'
import { Form, Checkbox } from 'antd'
import style from './CustomColumn.less'
import { ModalBlur } from '../../components'
const FormItem = Form.Item

const formItemLayout = {
  labelCol: {
    span: 4,
  },
  wrapperCol: {
    span: 20,
  },
}

const modal = ({
  columns,
  visible,
  onCancel,
  onOk,
  form: {
    getFieldDecorator,
    validateFields,
    getFieldsValue,
  },
}) => {
  function handleOk() {
    validateFields((errors) => {
      if (errors) {
        return
      }
      const data = {
        ...getFieldsValue(),
      }

      onOk(data)
    })
  }

  const options = [
    {
      value: 'state',
      label: 'State',
      disabled: true,
    },
    {
      value: 'id',
      label: 'Name',
      disabled: true,
    },
    {
      value: 'size',
      label: 'Size',
      disabled: true,
    },
    {
      value: 'actualSize',
      label: 'Actual Size',
    },
    {
      value: 'created',
      label: 'Created',
    },
    {
      value: 'kubernetesStatus',
      label: 'PV/PVC',
    },
    {
      value: 'namespace',
      label: 'Namespace',
    },
    {
      value: 'WorkloadNameAndPodName',
      label: 'Attached To',
      disabled: true,
    },
    {
      value: 'recurringJobs',
      label: 'Schedule',
    },
    {
      value: 'lastBackupAt',
      label: 'Last Backup At',
    },
    {
      value: 'replicas',
      label: 'Replicas',
    },
    {
      value: 'dataLocality',
      label: 'Data Locality',
    },
    {
      value: 'accessMode',
      label: 'Access Mode',
    },
    {
      value: 'dataEngine',
      label: 'Data Engine',
    },
  ]

  const modalOpts = {
    title: 'Custom Column',
    visible,
    onCancel,
    onOk: handleOk,
  }

  return (
    <ModalBlur {...modalOpts}>
      <Form layout="horizontal">
        <FormItem {...formItemLayout}>
          {getFieldDecorator('columns', {
            initialValue: columns,
            rules: [{ required: false }],
          })(<Checkbox.Group className={style.checkboxColumn} options={options} />)}
        </FormItem>
      </Form>
    </ModalBlur>
  )
}

modal.propTypes = {
  form: PropTypes.object.isRequired,
  visible: PropTypes.bool,
  onCancel: PropTypes.func,
  columns: PropTypes.array,
  onOk: PropTypes.func,
}

export default Form.create()(modal)
