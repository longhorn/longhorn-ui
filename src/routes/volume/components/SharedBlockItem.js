import React from 'react'
import PropTypes from 'prop-types'
import { Form, Checkbox, Icon, Tooltip } from 'antd'

const tooltip = 'Lets several nodes attach the volume at the same time as a raw block device. The applications coordinate the writes, for example with NVMe reservations. Requires the ReadWriteMany access mode and the Block Device frontend, and cannot be changed after the volume is created.'

// The field stays registered for v1 volumes, so switching the data engine or the
// volume tab can set it.
const SharedBlockItem = ({ getFieldDecorator, dataEngine, initialValue, onChange, formItemLayout }) => (
  <Form.Item
    label={
      <span>
        Shared Block
        <span style={{ marginLeft: 4, marginRight: 4 }}>
          <Tooltip overlayStyle={{ maxWidth: 350 }} title={tooltip}>
            <Icon type="question-circle-o" />
          </Tooltip>
        </span>
      </span>
    }
    style={dataEngine === 'v2' ? undefined : { display: 'none' }}
    {...formItemLayout}
  >
    {getFieldDecorator('sharedBlock', {
      valuePropName: 'checked',
      initialValue: initialValue || false,
    })(<Checkbox onChange={(e) => onChange(e.target.checked)} />)}
  </Form.Item>
)

SharedBlockItem.propTypes = {
  getFieldDecorator: PropTypes.func.isRequired,
  dataEngine: PropTypes.string,
  initialValue: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  formItemLayout: PropTypes.object,
}

export default SharedBlockItem
