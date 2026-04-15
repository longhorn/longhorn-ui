import React from 'react'
import PropTypes from 'prop-types'
import { Select, TimePicker } from 'antd'
import moment from 'moment'
import { withTranslation } from 'react-i18next'
const Option = Select.Option

class Schedule extends React.Component {
  state = {
    scheduleType: 'day',
    mins: '',
    hour: '',
    dom: '',
    month: '',
    dow: '',
  }

  UNSAFE_componentWillMount() {
    const { cron } = this.props
    this.setState(this.parseCron(cron))
  }

  UNSAFE_componentWillReceiveProps(nextProp) {
    const { cron } = nextProp
    this.setState(this.parseCron(cron))
  }

  onChange = (value, field) => {
    let [mins, hour] = [value, '']
    if (field === 'time' && value.indexOf(':') > -1) {
      [hour, mins] = value.split(':')
    }
    let state = {
      ...this.state,
    }
    switch (field) {
      case 'scheduleType':
        state = {
          scheduleType: value,
          mins: '0',
          hour: '0',
          dow: '0',
          dom: '1',
          month: '1',
        }
        break
      case 'time':
        state = {
          ...state,
          mins,
          hour,
        }
        break
      case 'dom':
        state = {
          ...state,
          dom: value,
        }
        break
      case 'dow':
        state = {
          ...state,
          dow: value,
        }
        break
      case 'month':
        state = {
          ...state,
          month: value,
        }
        break
      default:
    }
    let cron = ''
    switch (state.scheduleType) {
      case 'minute':
        cron = '* * * * *'
        break
      case 'hour':
        cron = `${state.mins} * * * *`
        break
      case 'day':
        cron = `${state.mins} ${state.hour} * * *`
        break
      case 'week':
        cron = `${state.mins} ${state.hour} * * ${state.dow}`
        break
      case 'month':
        cron = `${state.mins} ${state.hour} ${state.dom} * *`
        break
      case 'year':
        cron = `${state.mins} ${state.hour} ${state.dom} ${state.month} *`
        break
      default:
    }
    this.setState(state)
    this.props.onChange(cron)
  }

  parseCron = (cron) => {
    const d = cron.split(' ')
    let scheduleType = ''
    const v = {
      mins: d[0],
      hour: d[1],
      dom: d[2],
      month: d[3],
      dow: d[4],
    }
    if (v.month !== '*') {
      scheduleType = 'year'
    } else if (v.dom !== '*') {
      scheduleType = 'month'
    } else if (v.dow !== '*') {
      scheduleType = 'week'
    } else if (v.hour !== '*') {
      scheduleType = 'day'
    } else if (v.mins !== '*') {
      scheduleType = 'hour'
    } else {
      scheduleType = 'minute'
    }
    return {
      scheduleType,
      ...v,
    }
  }

  render() {
    const { t, editing } = this.props
    const { scheduleType, mins, hour, dom, month, dow } = this.state
    return (
      <div style={{ textAlign: 'center' }}>
        <span style={{ marginRight: '10px' }}>
          {t('schedule.common.every')}
        </span>
        <Select disabled={!editing} value={scheduleType} style={{ width: 120 }} onChange={(value) => this.onChange(value, 'scheduleType')}>
          <Option value="minute">{t('schedule.periods.minute')}</Option>
          <Option value="hour">{t('schedule.periods.hour')}</Option>
          <Option value="day">{t('schedule.periods.day')}</Option>
          <Option value="week">{t('schedule.periods.week')}</Option>
          <Option value="month">{t('schedule.periods.month')}</Option>
          <Option value="year">{t('schedule.periods.year')}</Option>
        </Select>

        {scheduleType === 'hour' && <span>
            <span style={{ marginRight: '10px', marginLeft: '10px' }}>{t('schedule.common.at')}</span>
            <TimePicker onChange={(momentValue, value) => this.onChange(value, 'time')} disabled={!editing} value={moment(mins, 'mm')} format={'mm'} />
            <span style={{ marginRight: '10px', marginLeft: '10px' }}>{t('schedule.hour.minutesPastTheHour')}</span>
          </span>}

        {scheduleType === 'day' && <span>
            <span style={{ marginRight: '10px', marginLeft: '10px' }}>{t('schedule.common.at')}</span>
            <TimePicker onChange={(momentValue, value) => this.onChange(value, 'time')} disabled={!editing} value={moment(`${hour}:${mins}`, 'HH:mm')} format={'HH:mm'} />
          </span>}

        {scheduleType === 'week' && <span>
            <span style={{ marginRight: '10px', marginLeft: '10px' }}>{t('schedule.common.on')}</span>
            <Select onChange={(value) => this.onChange(value, 'dow')} disabled={!editing} value={dow} style={{ width: 90 }}>
              <Option value="0">{t('schedule.weekDays.sunday')}</Option>
              <Option value="1">{t('schedule.weekDays.monday')}</Option>
              <Option value="2">{t('schedule.weekDays.tuesday')}</Option>
              <Option value="3">{t('schedule.weekDays.wednesday')}</Option>
              <Option value="4">{t('schedule.weekDays.thursday')}</Option>
              <Option value="5">{t('schedule.weekDays.friday')}</Option>
              <Option value="6">{t('schedule.weekDays.saturday')}</Option>
            </Select>
            <span style={{ marginRight: '10px', marginLeft: '10px' }}>{t('schedule.common.at')}</span>
            <TimePicker onChange={(momentValue, value) => this.onChange(value, 'time')} disabled={!editing} value={moment(`${hour}:${mins}`, 'HH:mm')} format={'HH:mm'} />
          </span>}

        {scheduleType === 'month' && <span>
            <span style={{ marginRight: '10px', marginLeft: '10px' }}>{t('schedule.common.onThe')}</span>
            <Select onChange={(value) => this.onChange(value, 'dom')} disabled={!editing} value={dom} style={{ width: 90 }}>
              <Option value="1">{t('schedule.days.1st')}</Option>
              <Option value="2">{t('schedule.days.2nd')}</Option>
              <Option value="3">{t('schedule.days.3rd')}</Option>
              <Option value="4">{t('schedule.days.4th')}</Option>
              <Option value="5">{t('schedule.days.5th')}</Option>
              <Option value="6">{t('schedule.days.6th')}</Option>
              <Option value="7">{t('schedule.days.7th')}</Option>
              <Option value="8">{t('schedule.days.8th')}</Option>
              <Option value="9">{t('schedule.days.9th')}</Option>
              <Option value="10">{t('schedule.days.10th')}</Option>
              <Option value="11">{t('schedule.days.11th')}</Option>
              <Option value="12">{t('schedule.days.12th')}</Option>
              <Option value="13">{t('schedule.days.13th')}</Option>
              <Option value="14">{t('schedule.days.14th')}</Option>
              <Option value="15">{t('schedule.days.15th')}</Option>
              <Option value="16">{t('schedule.days.16th')}</Option>
              <Option value="17">{t('schedule.days.17th')}</Option>
              <Option value="18">{t('schedule.days.18th')}</Option>
              <Option value="19">{t('schedule.days.19th')}</Option>
              <Option value="20">{t('schedule.days.20th')}</Option>
              <Option value="21">{t('schedule.days.21st')}</Option>
              <Option value="22">{t('schedule.days.22nd')}</Option>
              <Option value="23">{t('schedule.days.23rd')}</Option>
              <Option value="24">{t('schedule.days.24th')}</Option>
              <Option value="25">{t('schedule.days.25th')}</Option>
              <Option value="26">{t('schedule.days.26th')}</Option>
              <Option value="27">{t('schedule.days.27th')}</Option>
              <Option value="28">{t('schedule.days.28th')}</Option>
              <Option value="29">{t('schedule.days.29th')}</Option>
              <Option value="30">{t('schedule.days.30th')}</Option>
              <Option value="31">{t('schedule.days.31st')}</Option>
            </Select>
            <span style={{ marginRight: '10px', marginLeft: '10px' }}>{t('schedule.common.at')}</span>
            <TimePicker onChange={(momentValue, value) => this.onChange(value, 'time')} disabled={!editing} value={moment(`${hour}:${mins}`, 'HH:mm')} format={'HH:mm'} />
          </span>}

        {scheduleType === 'year' && <span>
            <span style={{ marginRight: '10px', marginLeft: '10px' }}>{t('schedule.common.onThe')}</span>
            <Select onChange={(value) => this.onChange(value, 'dom')} disabled={!editing} value={dom} style={{ width: 90 }}>
              <Option value="1">{t('schedule.days.1st')}</Option>
              <Option value="2">{t('schedule.days.2nd')}</Option>
              <Option value="3">{t('schedule.days.3rd')}</Option>
              <Option value="4">{t('schedule.days.4th')}</Option>
              <Option value="5">{t('schedule.days.5th')}</Option>
              <Option value="6">{t('schedule.days.6th')}</Option>
              <Option value="7">{t('schedule.days.7th')}</Option>
              <Option value="8">{t('schedule.days.8th')}</Option>
              <Option value="9">{t('schedule.days.9th')}</Option>
              <Option value="10">{t('schedule.days.10th')}</Option>
              <Option value="11">{t('schedule.days.11th')}</Option>
              <Option value="12">{t('schedule.days.12th')}</Option>
              <Option value="13">{t('schedule.days.13th')}</Option>
              <Option value="14">{t('schedule.days.14th')}</Option>
              <Option value="15">{t('schedule.days.15th')}</Option>
              <Option value="16">{t('schedule.days.16th')}</Option>
              <Option value="17">{t('schedule.days.17th')}</Option>
              <Option value="18">{t('schedule.days.18th')}</Option>
              <Option value="19">{t('schedule.days.19th')}</Option>
              <Option value="20">{t('schedule.days.20th')}</Option>
              <Option value="21">{t('schedule.days.21st')}</Option>
              <Option value="22">{t('schedule.days.22nd')}</Option>
              <Option value="23">{t('schedule.days.23rd')}</Option>
              <Option value="24">{t('schedule.days.24th')}</Option>
              <Option value="25">{t('schedule.days.25th')}</Option>
              <Option value="26">{t('schedule.days.26th')}</Option>
              <Option value="27">{t('schedule.days.27th')}</Option>
              <Option value="28">{t('schedule.days.28th')}</Option>
              <Option value="29">{t('schedule.days.29th')}</Option>
              <Option value="30">{t('schedule.days.30th')}</Option>
              <Option value="31">{t('schedule.days.31st')}</Option>
            </Select>
            <span style={{ marginRight: '10px', marginLeft: '10px' }}>{t('schedule.year.of')}</span>
            <Select onChange={(value) => this.onChange(value, 'month')} disabled={!editing} value={month} style={{ width: 90 }}>
              <Option value="1">{t('schedule.months.january')}</Option>
              <Option value="2">{t('schedule.months.february')}</Option>
              <Option value="3">{t('schedule.months.march')}</Option>
              <Option value="4">{t('schedule.months.april')}</Option>
              <Option value="5">{t('schedule.months.may')}</Option>
              <Option value="6">{t('schedule.months.june')}</Option>
              <Option value="7">{t('schedule.months.july')}</Option>
              <Option value="8">{t('schedule.months.august')}</Option>
              <Option value="9">{t('schedule.months.september')}</Option>
              <Option value="10">{t('schedule.months.october')}</Option>
              <Option value="11">{t('schedule.months.november')}</Option>
              <Option value="12">{t('schedule.months.december')}</Option>
            </Select>
            <span style={{ marginRight: '10px', marginLeft: '10px' }}>{t('schedule.common.at')}</span>
            <TimePicker onChange={(momentValue, value) => this.onChange(value, 'time')} disabled={!editing} value={moment(`${hour}:${mins}`, 'HH:mm')} format={'HH:mm'} />
          </span>}
      </div>
    )
  }
}


Schedule.propTypes = {
  cron: PropTypes.string,
  editing: PropTypes.bool,
  onChange: PropTypes.func,
  t: PropTypes.func.isRequired,
}

export default withTranslation()(Schedule)
