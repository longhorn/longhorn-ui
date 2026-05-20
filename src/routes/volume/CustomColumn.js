import React from 'react'
import PropTypes from 'prop-types'
import { Form, Checkbox } from 'antd'
import style from './CustomColumn.less'
import { ModalBlur } from '../../components'
import { withTranslation } from 'react-i18next'

const FormItem = Form.Item

const formItemLayout = {
  labelCol: {
    span: 5,
  },
  wrapperCol: {
    span: 24,
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

      onOk(data)
    })
  }

  const options = [
    {
      value: 'state',
      label: t('columns.state'),
      disabled: true,
    },
    {
      value: 'id',
      label: t('columns.name'),
      disabled: true,
    },
    {
      value: 'size',
      label: t('columns.size'),
      disabled: true,
    },
    {
      value: 'actualSize',
      label: t('columns.actualSize'),
    },
    {
      value: 'created',
      label: t('columns.created'),
    },
    {
      value: 'kubernetesStatus',
      label: t('columns.pvPvc'),
    },
    {
      value: 'namespace',
      label: t('columns.namespace'),
    },
    {
      value: 'WorkloadNameAndPodName',
      label: t('columns.attachedTo'),
      disabled: true,
    },
    {
      value: 'recurringJobs',
      label: t('columns.schedule'),
    },
    {
      value: 'lastBackupAt',
      label: t('columns.lastBackupAt'),
    },
    {
      value: 'backupTargetName',
      label: 'Backup Target',
    },
    {
      value: 'replicas',
      label: t('columns.replicas'),
    },
    {
      value: 'dataLocality',
      label: t('columns.dataLocality'),
    },
    {
      value: 'accessMode',
      label: t('columns.accessMode'),
    },
    {
      value: 'dataEngine',
      label: t('columns.dataEngine'),
    },
    {
      value: 'offlineRebuilding',
      label: t('columns.offlineRebuilding'),
    },
    {
      value: 'replicaRebuildingBandwidthLimit',
      label: t('columns.replicaRebuildingBandwidthLimit'),
    },
  ]

  const modalOpts = {
    title: t('customColumn.title'),
    visible,
    onCancel,
    onOk: handleOk,
    width: 680,
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
  t: PropTypes.func,
}

export default Form.create()(withTranslation()(modal))
