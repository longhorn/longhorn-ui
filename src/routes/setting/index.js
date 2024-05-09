import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import SettingForm from './setting'
import LeaveSettingsModal from './LeaveSettingsModal'
import { Prompt } from 'dva/router'
class Setting extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      changedSettings: {},
      modalVisible: false,
      nextLocation: null,
      confirmedNavigation: false,
    }
  }

  showModal = (location) => this.setState({
    modalVisible: true,
    nextLocation: location,
  })

  closeModal = (callback) => this.setState({
    modalVisible: false,
  }, callback)

  handleBlockedNavigation = (nextLocation) => {
    const { confirmedNavigation, changedSettings } = this.state
    const isDirty = Object.keys(changedSettings).length > 0

    if (isDirty && !confirmedNavigation) {
      this.showModal(nextLocation)
      return false // disallow navigation
    }
    return true // allow navigation
  }

  handleConfirmNavigationClick = () => this.closeModal(() => {
    const { history } = this.props
    const { nextLocation } = this.state
    if (nextLocation) {
      this.setState({
        confirmedNavigation: true,
      }, () => {
        history.push(nextLocation.pathname)
      })
    }
  })

  onInputChange = (displayName, newValue) => {
    const { setting: { data } } = this.props
    const targetSettingOldValue = data.find(d => d.definition.displayName === displayName)?.value
    if (targetSettingOldValue !== undefined && targetSettingOldValue.toString() !== newValue.toString()) {
      this.setState(prevState => ({
        changedSettings: {
          ...prevState.changedSettings,
          [displayName]: newValue,
        },
      }))
    } else {
      this.setState(prevState => {
        const prevChangedSettings = { ...prevState.changedSettings }
        if (displayName in prevChangedSettings) {
          delete prevChangedSettings[displayName]
        }
        return {
          changedSettings: {
            ...prevChangedSettings,
          },
        }
      })
    }
  }

  resetChangedSettings = () => {
    this.setState({
      ...this.state,
      changedSettings: {},
    })
  }

  render() {
    const { setting, dispatch, loading } = this.props
    const { modalVisible, changedSettings } = this.state
    const { data, saving } = setting

    const settingFormProps = {
      data,
      saving,
      loading,
      onSubmit(payload) {
        dispatch({
          type: 'setting/update',
          payload,
        })
      },
      resetChangedSettings: this.resetChangedSettings,
      onInputChange: this.onInputChange,
    }

    return (
      <div className="content-inner" style={{ overflow: 'hidden' }}>
        <SettingForm {...settingFormProps} />
        <Prompt
          when
          message={this.handleBlockedNavigation}
        />
        {modalVisible && (
          <LeaveSettingsModal
            visible={modalVisible}
            onCancel={() => this.closeModal()}
            onOk={this.handleConfirmNavigationClick}
            changedSettings={changedSettings}
          />
        )}
      </div>
    )
  }
}

Setting.propTypes = {
  setting: PropTypes.object,
  dispatch: PropTypes.func,
  loading: PropTypes.bool,
  history: PropTypes.object,
}

export default connect(({ setting, loading }) => ({ setting, loading: loading.models.setting }))(Setting)
