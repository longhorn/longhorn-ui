import React from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'

class Schedule extends React.Component {
  state = {
    scheduleType: 'day',
    mins: '',
    hour: '',
    dom: '',
    month: '',
    dow: '',
    weekArr: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    dayArr: ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th', '13th', '14th', '15th', '16th', '17th', '18th', '19th', '20th', '21st', '22nd', '23rd', '24th', '25th', '26rd', '27th', '28th', '29rd', '30th', '31st'],
    monthArr: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  }

  UNSAFE_componentWillMount() {
    const { cron } = this.props
    this.setState(this.parseCron(cron))
  }

  UNSAFE_componentWillReceiveProps(nextProp) {
    const { cron } = nextProp
    this.setState(this.parseCron(cron))
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
      v.month = this.state.monthArr[v.month]
      v.dom = this.state.dayArr[v.dom - 1]
    } else if (v.dom !== '*') {
      scheduleType = 'month'
      v.dom = this.state.dayArr[v.dom - 1]
    } else if (v.dow !== '*') {
      scheduleType = 'week'
      v.dow = this.state.weekArr[v.dow]
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
    return (
      <div style={{ textAlign: 'left', display: 'inline' }}>
        <span style={{ marginRight: '3px' }}>
          Every
        </span>
        <span>
          { scheduleType }
        </span>
        {scheduleType === 'hour' && <span>
            <span style={{ marginRight: '3px', marginLeft: '3px' }}>at</span>
            <span style={{ marginRight: '3px', marginLeft: '3px' }}>{ moment(mins, 'mm').format('HH:mm') }</span>
            <span style={{ marginRight: '3px', marginLeft: '3px' }}>minutes past the hour</span>
          </span>
        }

        {scheduleType === 'day' && <span>
            <span style={{ marginRight: '3px', marginLeft: '3px' }}>at</span>
            <span style={{ marginRight: '3px', marginLeft: '3px' }}>{ moment(`${hour}:${mins}`, 'HH:mm').format('HH:mm')}</span>
          </span>
        }

        {scheduleType === 'week' && <span>
            <span style={{ marginRight: '3px', marginLeft: '3px' }}>on</span>
            <span style={{ marginRight: '3px', marginLeft: '3px' }}>{dow}</span>
            <span style={{ marginRight: '3px', marginLeft: '3px' }}>at</span>
            <span style={{ marginRight: '3px', marginLeft: '3px' }}>{ moment(`${hour}:${mins}`, 'HH:mm').format('HH:mm')}</span>
          </span>
        }

        {scheduleType === 'month' && <span>
            <span style={{ marginRight: '3px', marginLeft: '3px' }}>on the</span>
            <span style={{ marginRight: '3px', marginLeft: '3px' }}>{dom}</span>
            <span style={{ marginRight: '3px', marginLeft: '3px' }}>at</span>
            <span style={{ marginRight: '3px', marginLeft: '3px' }}>{ moment(`${hour}:${mins}`, 'HH:mm').format('HH:mm')}</span>
          </span>
        }

        {scheduleType === 'year' && <span>
            <span style={{ marginRight: '3px', marginLeft: '3px' }}>on the</span>
            <span style={{ marginRight: '3px', marginLeft: '3px' }}>{month}</span>
            <span style={{ marginRight: '3px', marginLeft: '3px' }}>of</span>
            <span style={{ marginRight: '3px', marginLeft: '3px' }}>{dom}</span>
            <span style={{ marginRight: '3px', marginLeft: '3px' }}>at</span>
            <span style={{ marginRight: '3px', marginLeft: '3px' }}>{ moment(`${hour}:${mins}`, 'HH:mm').format('HH:mm')}</span>
          </span>
        }
      </div>
    )
  }
}


Schedule.propTypes = {
  cron: PropTypes.string,
}

export default Schedule
