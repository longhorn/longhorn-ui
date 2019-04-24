import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import SettingForm from './setting'

function Setting({ setting, dispatch, loading }) {
  const { data, saving } = setting
  const props = {
    data,
    saving,
    loading,
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
  loading: PropTypes.bool,
}

export default connect(({ setting, loading }) => ({ setting, loading: loading.models.setting }))(Setting)
