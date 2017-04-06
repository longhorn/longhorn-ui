import React, { PropTypes } from 'react'
import { Snapshot, ModalBlur } from '../../components'


const modal = (props) => {
  return (
    <ModalBlur width="1000" className="lh-modal-snapshot" {...props}>
      <Snapshot volume={props.volume} />
    </ModalBlur>
  )
}

modal.propTypes = {
  visible: PropTypes.bool,
  onCancel: PropTypes.func,
  item: PropTypes.object,
  onOk: PropTypes.func,
  volume: PropTypes.string,
}

export default modal
