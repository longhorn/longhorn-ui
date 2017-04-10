import React, { PropTypes } from 'react'
import { Select } from 'antd'
const Option = Select.Option

class Schedule extends React.Component {
  render() {
    return (
              <div>
                <span style={{ marginRight: '10px' }}>
                  Every
                </span>
                <Select defaultValue="day" style={{ width: 90 }}>
                  <Option value="minute">minute</Option>
                  <Option value="hour">hour</Option>
                  <Option value="day">day</Option>
                  <Option value="week">week</Option>
                  <Option value="month">month</Option>
                  <Option value="year">year</Option>
                </Select>
              </div>
    )
  }
}


Schedule.propTypes = {
  cron: PropTypes.string,
}

export default Schedule
