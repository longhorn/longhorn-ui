import React, { PropTypes } from 'react'
import { Select, TimePicker } from 'antd'
const Option = Select.Option

class Schedule extends React.Component {
  state = {
    scheduleType: 'day',
  }
  onScheduleTypeChange = (value) => {
    this.setState({
      scheduleType: value,
    })
  }
  render() {
    const { scheduleType } = this.state
    return (
      <div style={{ textAlign: 'left' }}>
        <span style={{ marginRight: '10px' }}>
          Every
        </span>
        <Select defaultValue={scheduleType} style={{ width: 90 }} onChange={this.onScheduleTypeChange}>
          <Option value="minute">minute</Option>
          <Option value="hour">hour</Option>
          <Option value="day">day</Option>
          <Option value="week">week</Option>
          <Option value="month">month</Option>
          <Option value="year">year</Option>
        </Select>

        {scheduleType === 'hour' &&
          <span>
            <span style={{ marginRight: '10px', marginLeft: '10px' }}>at</span>
            <TimePicker format={'mm'} />
            <span style={{ marginRight: '10px', marginLeft: '10px' }}>minutes past the hour</span>
          </span>}

        {scheduleType === 'day' &&
          <span>
            <span style={{ marginRight: '10px', marginLeft: '10px' }}>at</span>
            <TimePicker format={'HH:mm'} />
          </span>}

        {scheduleType === 'week' &&
          <span>
            <span style={{ marginRight: '10px', marginLeft: '10px' }}>on</span>
            <Select style={{ width: 90 }}>
              <Option value="sunday">Sunday</Option>
              <Option value="monday">Monday</Option>
              <Option value="tuesday">Tuesday</Option>
              <Option value="wednesday">Wednesday</Option>
              <Option value="thursday">Thursday</Option>
              <Option value="friday">Friday</Option>
              <Option value="saturday">Saturday</Option>
            </Select>
            <span style={{ marginRight: '10px', marginLeft: '10px' }}>at</span>
            <TimePicker format={'HH:mm'} />
          </span>}

        {scheduleType === 'month' &&
          <span>
            <span style={{ marginRight: '10px', marginLeft: '10px' }}>on the</span>
            <Select style={{ width: 90 }}>
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
            <TimePicker format={'HH:mm'} />
          </span>}

        {scheduleType === 'year' &&
          <span>
            <span style={{ marginRight: '10px', marginLeft: '10px' }}>on the</span>
            <Select style={{ width: 90 }}>
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
            <Select style={{ width: 90 }}>
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
            <TimePicker format={'HH:mm'} />
          </span>}

      </div>
    )
  }
}


Schedule.propTypes = {
  cron: PropTypes.string,
}

export default Schedule
