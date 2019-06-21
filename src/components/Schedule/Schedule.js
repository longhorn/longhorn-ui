import React from 'react'
import PropTypes from 'prop-types'
import { Select, TimePicker } from 'antd'
import moment from 'moment'
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
    const { scheduleType, mins, hour, dom, month, dow } = this.state
    const { editing } = this.props
    return (
      <div style={{ textAlign: 'center' }}>
        <span style={{ marginRight: '10px' }}>
          Every
        </span>
        <Select disabled={!editing} value={scheduleType} style={{ width: 120 }} onChange={(value) => this.onChange(value, 'scheduleType')}>
          <Option value="minute">minute</Option>
          <Option value="hour">hour</Option>
          <Option value="day">day</Option>
          <Option value="week">week</Option>
          <Option value="month">month</Option>
          <Option value="year">year</Option>
        </Select>

        {scheduleType === 'hour' && <span>
            <span style={{ marginRight: '10px', marginLeft: '10px' }}>at</span>
            <TimePicker onChange={(momentValue, value) => this.onChange(value, 'time')} disabled={!editing} value={moment(mins, 'mm')} format={'mm'} />
            <span style={{ marginRight: '10px', marginLeft: '10px' }}>minutes past the hour</span>
          </span>}

        {scheduleType === 'day' && <span>
            <span style={{ marginRight: '10px', marginLeft: '10px' }}>at</span>
            <TimePicker onChange={(momentValue, value) => this.onChange(value, 'time')} disabled={!editing} value={moment(`${hour}:${mins}`, 'HH:mm')} format={'HH:mm'} />
          </span>}

        {scheduleType === 'week' && <span>
            <span style={{ marginRight: '10px', marginLeft: '10px' }}>on</span>
            <Select onChange={(value) => this.onChange(value, 'dow')} disabled={!editing} value={dow} style={{ width: 90 }}>
              <Option value="0">Sunday</Option>
              <Option value="1">Monday</Option>
              <Option value="2">Tuesday</Option>
              <Option value="3">Wednesday</Option>
              <Option value="4">Thursday</Option>
              <Option value="5">Friday</Option>
              <Option value="6">Saturday</Option>
            </Select>
            <span style={{ marginRight: '10px', marginLeft: '10px' }}>at</span>
            <TimePicker onChange={(momentValue, value) => this.onChange(value, 'time')} disabled={!editing} value={moment(`${hour}:${mins}`, 'HH:mm')} format={'HH:mm'} />
          </span>}

        {scheduleType === 'month' && <span>
            <span style={{ marginRight: '10px', marginLeft: '10px' }}>on the</span>
            <Select onChange={(value) => this.onChange(value, 'dom')} disabled={!editing} value={dom} style={{ width: 90 }}>
              <Option value="1">1st</Option>
              <Option value="2">2nd</Option>
              <Option value="3">3rd</Option>
              <Option value="4">4th</Option>
              <Option value="5">5th</Option>
              <Option value="6">6th</Option>
              <Option value="7">7th</Option>
              <Option value="8">8th</Option>
              <Option value="9">9th</Option>
              <Option value="10">10th</Option>
              <Option value="11">11th</Option>
              <Option value="12">12th</Option>
              <Option value="13">13th</Option>
              <Option value="14">14th</Option>
              <Option value="15">15th</Option>
              <Option value="16">16th</Option>
              <Option value="17">17th</Option>
              <Option value="18">18th</Option>
              <Option value="19">19th</Option>
              <Option value="20">20th</Option>
              <Option value="21">21st</Option>
              <Option value="22">22nd</Option>
              <Option value="23">23rd</Option>
              <Option value="24">24th</Option>
              <Option value="25">25th</Option>
              <Option value="26">26th</Option>
              <Option value="27">27th</Option>
              <Option value="28">28th</Option>
              <Option value="29">29th</Option>
              <Option value="30">30th</Option>
              <Option value="31">31st</Option>
            </Select>
            <span style={{ marginRight: '10px', marginLeft: '10px' }}>at</span>
            <TimePicker onChange={(momentValue, value) => this.onChange(value, 'time')} disabled={!editing} value={moment(`${hour}:${mins}`, 'HH:mm')} format={'HH:mm'} />
          </span>}

        {scheduleType === 'year' && <span>
            <span style={{ marginRight: '10px', marginLeft: '10px' }}>on the</span>
            <Select onChange={(value) => this.onChange(value, 'dom')} disabled={!editing} value={dom} style={{ width: 90 }}>
              <Option value="1">1st</Option>
              <Option value="2">2nd</Option>
              <Option value="3">3rd</Option>
              <Option value="4">4th</Option>
              <Option value="5">5th</Option>
              <Option value="6">6th</Option>
              <Option value="7">7th</Option>
              <Option value="8">8th</Option>
              <Option value="9">9th</Option>
              <Option value="10">10th</Option>
              <Option value="11">11th</Option>
              <Option value="12">12th</Option>
              <Option value="13">13th</Option>
              <Option value="14">14th</Option>
              <Option value="15">15th</Option>
              <Option value="16">16th</Option>
              <Option value="17">17th</Option>
              <Option value="18">18th</Option>
              <Option value="19">19th</Option>
              <Option value="20">20th</Option>
              <Option value="21">21st</Option>
              <Option value="22">22nd</Option>
              <Option value="23">23rd</Option>
              <Option value="24">24th</Option>
              <Option value="25">25th</Option>
              <Option value="26">26th</Option>
              <Option value="27">27th</Option>
              <Option value="28">28th</Option>
              <Option value="29">29th</Option>
              <Option value="30">30th</Option>
              <Option value="31">31st</Option>
            </Select>
            <span style={{ marginRight: '10px', marginLeft: '10px' }}>of</span>
            <Select onChange={(value) => this.onChange(value, 'month')} disabled={!editing} value={month} style={{ width: 90 }}>
              <Option value="1">January</Option>
              <Option value="2">February</Option>
              <Option value="3">March</Option>
              <Option value="4">April</Option>
              <Option value="5">May</Option>
              <Option value="6">June</Option>
              <Option value="7">July</Option>
              <Option value="8">August</Option>
              <Option value="9">September</Option>
              <Option value="10">October</Option>
              <Option value="11">November</Option>
              <Option value="12">December</Option>
            </Select>
            <span style={{ marginRight: '10px', marginLeft: '10px' }}>at</span>
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
}

export default Schedule
