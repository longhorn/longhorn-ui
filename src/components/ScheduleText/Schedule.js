import React from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import { withTranslation } from 'react-i18next'

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

  componentDidMount() {
    const { t } = this.props
    this.setState({
      weekArr: [
        t('schedule.weekDays.sunday'),
        t('schedule.weekDays.monday'),
        t('schedule.weekDays.tuesday'),
        t('schedule.weekDays.wednesday'),
        t('schedule.weekDays.thursday'),
        t('schedule.weekDays.friday'),
        t('schedule.weekDays.saturday')
      ],
      dayArr: [
        t('schedule.days.1st'),
        t('schedule.days.2nd'),
        t('schedule.days.3rd'),
        t('schedule.days.4th'),
        t('schedule.days.5th'),
        t('schedule.days.6th'),
        t('schedule.days.7th'),
        t('schedule.days.8th'),
        t('schedule.days.9th'),
        t('schedule.days.10th'),
        t('schedule.days.11th'),
        t('schedule.days.12th'),
        t('schedule.days.13th'),
        t('schedule.days.14th'),
        t('schedule.days.15th'),
        t('schedule.days.16th'),
        t('schedule.days.17th'),
        t('schedule.days.18th'),
        t('schedule.days.19th'),
        t('schedule.days.20th'),
        t('schedule.days.21st'),
        t('schedule.days.22nd'),
        t('schedule.days.23rd'),
        t('schedule.days.24th'),
        t('schedule.days.25th'),
        t('schedule.days.26th'),
        t('schedule.days.27th'),
        t('schedule.days.28th'),
        t('schedule.days.29th'),
        t('schedule.days.30th'),
        t('schedule.days.31st')
      ],
      monthArr: [
        t('schedule.months.january'),
        t('schedule.months.february'),
        t('schedule.months.march'),
        t('schedule.months.april'),
        t('schedule.months.may'),
        t('schedule.months.june'),
        t('schedule.months.july'),
        t('schedule.months.august'),
        t('schedule.months.september'),
        t('schedule.months.october'),
        t('schedule.months.november'),
        t('schedule.months.december')
      ],
    }, () => {
      const { cron } = this.props
      this.setState(this.parseCron(cron))
    })
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
    const { t } = this.props
    const { scheduleType, mins, hour, dom, month, dow } = this.state
    return (
      <div style={{ textAlign: 'left', display: 'inline' }}>
        <span style={{ marginRight: '3px' }}>
          {t('schedule.common.every')}
        </span>
        <span>
          { scheduleType }
        </span>
        {scheduleType === 'hour' && <span>
            <span style={{ marginRight: '3px', marginLeft: '3px' }}>{t('schedule.common.at')}</span>
            <span style={{ marginRight: '3px', marginLeft: '3px' }}>{ moment(mins, 'mm').format('HH:mm') }</span>
            <span style={{ marginRight: '3px', marginLeft: '3px' }}>{t('schedule.hour.minutesPastTheHour')}</span>
          </span>
        }

        {scheduleType === 'day' && <span>
            <span style={{ marginRight: '3px', marginLeft: '3px' }}>{t('schedule.common.at')}</span>
            <span style={{ marginRight: '3px', marginLeft: '3px' }}>{ moment(`${hour}:${mins}`, 'HH:mm').format('HH:mm')}</span>
          </span>
        }

        {scheduleType === 'week' && <span>
            <span style={{ marginRight: '3px', marginLeft: '3px' }}>{t('schedule.common.on')}</span>
            <span style={{ marginRight: '3px', marginLeft: '3px' }}>{dow}</span>
            <span style={{ marginRight: '3px', marginLeft: '3px' }}>{t('schedule.common.at')}</span>
            <span style={{ marginRight: '3px', marginLeft: '3px' }}>{ moment(`${hour}:${mins}`, 'HH:mm').format('HH:mm')}</span>
          </span>
        }

        {scheduleType === 'month' && <span>
            <span style={{ marginRight: '3px', marginLeft: '3px' }}>{t('schedule.common.onThe')}</span>
            <span style={{ marginRight: '3px', marginLeft: '3px' }}>{dom}</span>
            <span style={{ marginRight: '3px', marginLeft: '3px' }}>{t('schedule.common.at')}</span>
            <span style={{ marginRight: '3px', marginLeft: '3px' }}>{ moment(`${hour}:${mins}`, 'HH:mm').format('HH:mm')}</span>
          </span>
        }

        {scheduleType === 'year' && <span>
            <span style={{ marginRight: '3px', marginLeft: '3px' }}>{t('schedule.common.onThe')}</span>
            <span style={{ marginRight: '3px', marginLeft: '3px' }}>{dom}</span>
            <span style={{ marginRight: '3px', marginLeft: '3px' }}>{t('schedule.year.of')}</span>
            <span style={{ marginRight: '3px', marginLeft: '3px' }}>{month}</span>
            <span style={{ marginRight: '3px', marginLeft: '3px' }}>{t('schedule.common.at')}</span>
            <span style={{ marginRight: '3px', marginLeft: '3px' }}>{ moment(`${hour}:${mins}`, 'HH:mm').format('HH:mm')}</span>
          </span>
        }
      </div>
    )
  }
}


Schedule.propTypes = {
  cron: PropTypes.string,
  t: PropTypes.func.isRequired,
}

export default withTranslation()(Schedule)
