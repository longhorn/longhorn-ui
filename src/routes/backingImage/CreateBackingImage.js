import React from 'react'
import PropTypes from 'prop-types'
import { Form, Input, Select, Upload, Button, Icon } from 'antd'
import { ModalBlur, AutoComplete } from '../../components'
const FormItem = Form.Item
const Option = Select.Option

const formItemLayout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 15,
  },
}

const modal = ({
  item,
  volumeNameOptions,
  visible,
  onCancel,
  onOk,
  form: {
    getFieldDecorator,
    validateFields,
    getFieldsValue,
    setFieldsValue,
    getFieldValue,
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

  const modalOpts = {
    title: 'Create Backing Image',
    visible,
    onCancel,
    width: 1040,
    onOk: handleOk,
  }

  const selectChange = (value) => {
    if (value === 'upload') {
      setFieldsValue({
        imageURL: '',
        volumeName: '',
      })
    } else if (value === 'download') {
      setFieldsValue({
        fileContainer: null,
        volumeName: '',
      })
    } else {
      setFieldsValue({
        fileContainer: null,
        imageURL: '',
        expectedChecksum: '',
      })
    }
  }

  const uploadProps = {
    showUploadList: false,
    beforeUpload: (file) => {
      setFieldsValue({
        fileContainer: file,
      })
      return false
    },
  }

  const autoCompleteProps = {
    options: volumeNameOptions,
    autoCompleteChange: (value) => {
      setFieldsValue({
        volumeName: value,
      })
    },
  }

  const creationType = getFieldValue('type')
  return (
    <ModalBlur {...modalOpts}>
      <Form layout="horizontal">
        <FormItem label="Name" hasFeedback {...formItemLayout}>
          {getFieldDecorator('name', {
            initialValue: item.name,
            rules: [
              {
                required: true,
                message: 'Please input backing image name',
              },
            ],
          })(<Input />)}
        </FormItem>
        <FormItem label="Created From" {...formItemLayout}>
          {getFieldDecorator('type', {
            valuePropName: 'type',
            initialValue: 'download',
            rules: [
              {
                required: true,
              },
            ],
          })(<Select defaultValue={'download'} onChange={selectChange}>
            <Option value={'download'}>Download From URL</Option>
            <Option value={'upload'}>Upload From Local</Option>
            <Option value={'volume'}>Export from a Longhorn volume</Option>
          </Select>)}
        </FormItem>
        <FormItem label="Volume Name" {...formItemLayout} style={{ display: creationType === 'volume' ? 'block' : 'none' }}>
          {getFieldDecorator('volumeName', {
            initialValue: '',
            valuePropName: 'value',
            rules: [
              {
                required: creationType === 'volume',
                message: 'Please input volume name',
              },
              {
                validator: (rule, value, callback) => {
                  if (creationType === 'volume') {
                    if (volumeNameOptions && volumeNameOptions.includes(value)) {
                      callback()
                    } else {
                      callback('Please select an existing Longhorn volume.')
                    }
                  } else {
                    callback()
                  }
                },
              },
            ],
          })(<AutoComplete {...autoCompleteProps}></AutoComplete>)}
        </FormItem>
        <FormItem label="Exported Backing Image Type" {...formItemLayout} style={{ display: creationType === 'volume' ? 'block' : 'none' }}>
          {getFieldDecorator('exportType', {
            valuePropName: 'exportType',
            initialValue: 'raw',
            rules: [
              {
                required: true,
              },
            ],
          })(<Select defaultValue={'raw'}>
            <Option value={'raw'}>raw</Option>
            <Option value={'qcow2'}>qcow2</Option>
          </Select>)}
        </FormItem>
        <FormItem label="URL" {...formItemLayout} style={{ display: creationType === 'download' ? 'block' : 'none' }}>
          {getFieldDecorator('imageURL', {
            initialValue: item.imageURL,
            rules: [
              {
                required: creationType === 'download',
                message: 'Please input backing image url',
              },
            ],
          })(<Input disabled={!(creationType === 'download')} />)}
        </FormItem>
        <FormItem label="File" {...formItemLayout} style={{ display: creationType === 'upload' ? 'block' : 'none' }}>
          {getFieldDecorator('fileContainer', {
            valuePropName: 'fileContainer',
            initialValue: null,
            rules: [
              {
                required: creationType === 'upload',
                message: 'Please upload backing image file',
              },
              {
                validator: (rule, value, callback) => {
                  if (creationType === 'upload') {
                    let size = 0
                    if (value && value.size) {
                      size = value.size
                    }
                    if (size % 512 === 0) {
                      callback()
                    } else {
                      callback('Must be a multiple of 512 bytes')
                    }
                  } else {
                    callback()
                  }
                },
              },
            ],
          })(<Upload {...uploadProps}>
            <Button disabled={!(creationType === 'upload')}>
              <Icon type="upload" /> Upload
            </Button>
          </Upload>)}
          <span style={{ marginLeft: 10 }}>{ getFieldsValue().fileContainer && getFieldsValue().fileContainer.file ? getFieldsValue().fileContainer.file.name : ''}</span>
        </FormItem>
        <FormItem label="Expected Checksum" {...formItemLayout} style={{ display: creationType !== 'volume' ? 'block' : 'none' }}>
          {getFieldDecorator('expectedChecksum', {
            initialValue: '',
            rules: [
              {
                required: false,
              },
            ],
          })(<Input placeholder="Ask Longhorn to validate the SHA512 checksum if it’s specified here." />)}
        </FormItem>
      </Form>
    </ModalBlur>
  )
}

modal.propTypes = {
  form: PropTypes.object.isRequired,
  visible: PropTypes.bool,
  onCancel: PropTypes.func,
  item: PropTypes.object,
  onOk: PropTypes.func,
  volumeNameOptions: PropTypes.array,
}

export default Form.create()(modal)
