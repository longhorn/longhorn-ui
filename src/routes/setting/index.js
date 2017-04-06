import React, { PropTypes } from 'react'
import { connect } from 'dva'
import SettingForm from './setting'

function Setting({ setting, dispatch }) {
  const { data, saving } = setting
  const props = {
    data,
    saving,
    onSubmit(payload) {
      dispatch({
        type: 'setting/update',
        payload,
      })
    },
  }

  return (
    <div className="content-inner">
      <SettingForm {...props} />
    </div>
  )
}

Setting.propTypes = {
  setting: PropTypes.object,
  dispatch: PropTypes.func,
}

export default connect(({ setting }) => ({ setting }))(Setting)
