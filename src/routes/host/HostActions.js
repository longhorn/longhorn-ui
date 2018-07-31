import React, { PropTypes } from 'react'
import { Radio } from 'antd'
import styles from './HostActions.less'

function actions({ selected, toggleScheduling }) {
  return (
    <div style={{ paddingRight: '10px' }}>
    <Radio.Group value={selected.allowScheduling} buttonStyle="solid" onChange={() => toggleScheduling(selected)} size="large">
      <Radio.Button value className={selected.allowScheduling ? styles.radioButtonChecked : styles.radioButton}>Enabled</Radio.Button>
      <Radio.Button value={false} className={selected.allowScheduling ? styles.radioButton : styles.radioButtonChecked} >Disabled</Radio.Button>
    </Radio.Group>
    </div>
  )
}

actions.propTypes = {
  selected: PropTypes.object,
  toggleScheduling: PropTypes.func,
}

export default actions
