import React from 'react'
import PropTypes from 'prop-types'
import { List } from 'antd'
import { ModalBlur } from '../../components'

const modal = ({
  visible,
  versions,
  onOk,
  onCancel,
}) => {
  const title = (<div>
    <div>Newer Stable Versions</div>
    <small style={{ color: '#9c9c9c' }}>We only show the latest stable version of Longhorn minor releases. For the full list, please check out the <a target="blank" href="https://github.com/longhorn/longhorn/releases">release page</a></small>
  </div>)
  const modalOpts = {
    title,
    visible,
    onOk,
    onCancel,
    hasOnCancel: true,
  }

  return (
    <ModalBlur {...modalOpts}>
      <div style={{ maxHeight: 800, overflow: 'auto' }}>
        <List
          bordered
          dataSource={versions}
          renderItem={item => (<List.Item>{item}</List.Item>)} />
      </div>
    </ModalBlur>
  )
}

modal.propTypes = {
  visible: PropTypes.bool,
  versions: PropTypes.array,
  onOk: PropTypes.func,
  onCancel: PropTypes.func,
}

export default modal
