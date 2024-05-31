import React from 'react'
import { Tabs, Row, Col, Radio, InputNumber, Select, Input, Steps, Button, message } from 'antd'
import prettyCron from '../../utils/prettycron'
import cronValidate from '../../utils/cronValidate'
import PropTypes from 'prop-types'
import style from './ReactCron.less'

const TabPane = Tabs.TabPane
const RadioGroup = Radio.Group
const Option = Select.Option
const { Step } = Steps
const steps = [
  {
    title: 'Minutes',
    content: 'minutes',
  },
  {
    title: 'Hour',
    content: 'hour',
  },
  {
    title: 'Day',
    content: 'day',
  },
  {
    title: 'Month',
    content: 'month',
  },
]

class ReactCron extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      prettyCronText: '',
      secondText: '*',
      cornText: '',
      cornFormat: false,
      current: 0,
      activeKey: 'Cron',
      second: {
        cronEvery: '1',
        incrementStart: 3,
        incrementIncrement: 5,
        rangeStart: 1,
        rangeEnd: 0,
        specificSpecific: [],
      },
      minutesText: '*',
      minutesValue: null,
      minutes: {
        cronEvery: '1',
        incrementStart: 3,
        incrementIncrement: 5,
        rangeStart: 0,
        rangeEnd: 0,
        specificSpecific: [],
      },
      hourText: '*',
      hourValue: null,
      hour: {
        cronEvery: '1',
        incrementStart: 3,
        incrementIncrement: 5,
        rangeStart: 0,
        rangeEnd: 0,
        specificSpecific: [],
      },
      dayText: '*',
      dayValue: null,
      day: {
        cronEvery: '1',
        incrementStart: 1,
        incrementIncrement: 1,
        rangeStart: 1,
        rangeEnd: 0,
        specificSpecific: [],
        cronLastSpecificDomDay: '1L',
        cronDaysBeforeEomMinus: 1,
        cronDaysNearestWeekday: 1,
      },
      weekText: '?',
      week: {
        cronEvery: '',
        incrementStart: '1',
        incrementIncrement: '1',
        specificSpecific: [],
        cronNthDayDay: '1',
        cronNthDayNth: '1',
      },
      monthText: '*',
      monthValue: null,
      month: {
        cronEvery: '1',
        incrementStart: 3,
        incrementIncrement: 5,
        rangeStart: 1,
        rangeEnd: 1,
        specificSpecific: [],
      },
      yearText: '*',
      year: {
        cronEvery: '1',
        incrementStart: 1,
        incrementIncrement: 2019,
        rangeStart: 2019,
        rangeEnd: 2019,
        specificSpecific: [],
      },
    }
  }

  componentDidMount() {
    let cornText = this.props.cron ? this.props.cron : `${this.state.minutesText} ${this.state.hourText} ${this.state.dayText} ${this.state.monthText} ${this.state.weekText}`
    let prettyCronText = prettyCron.toString(cornText)
    this.setState({
      ...this.state,
      cornText,
      prettyCronText,
    }, () => {
      if (!cronValidate(cornText)) {
        this.setState({
          ...this.state,
          cornFormat: true,
        })
        this.props.saveDisabled()
      } else {
        this.setState({
          ...this.state,
          cornFormat: false,
        })
        this.props.changeCron(cornText)
      }
    })
  }

  prettyCronfun = () => {
    let cornText = `${this.state.minutesText} ${this.state.hourText} ${this.state.dayText} ${this.state.monthText} ${this.state.weekText}`
    let prettyCronText = prettyCron.toString(`${this.state.minutesText} ${this.state.hourText} ${this.state.dayText} ${this.state.monthText} ${this.state.weekText}`)
    this.setState({
      ...this.state,
      cornText,
      prettyCronText,
    }, () => {
      if (!cronValidate(cornText)) {
        this.setState({
          ...this.state,
          cornFormat: true,
        })
        this.props.saveDisabled()
      } else {
        this.setState({
          ...this.state,
          cornFormat: false,
        })
        this.props.changeCron(cornText)
      }
    })
  }

  /* second */
  secondOnChange = (val) => {
    let seconds = '*'
    let cronEvery = val.target ? val.target.value : val
    let data = Object.assign({}, this.state.second, { cronEvery: cronEvery.toString() })
    switch (cronEvery.toString()) {
      case '1':
        this.setState({
          ...this.state,
          secondText: '*',
          second: data,
        })
        this.prettyCronfun()
        break
      case '2':
        seconds = `${this.state.second.incrementStart}/${this.state.second.incrementIncrement}`
        this.setState({
          ...this.state,
          secondText: seconds,
          second: data,
        })
        this.prettyCronfun()
        break
      case '3':
        if (this.state.second.specificSpecific.length > 0) {
          seconds = ''
          this.state.second.specificSpecific.forEach(val => {
            seconds += `${val},`
          })
          seconds = seconds.slice(0, -1)
        }
        this.setState({
          ...this.state,
          secondText: seconds,
          second: data,
        })
        this.prettyCronfun()
        break
      case '4':
        seconds = `${this.state.second.rangeStart}-${this.state.second.rangeEnd}`
        this.setState({
          ...this.state,
          secondText: seconds,
          second: data,
        })
        this.prettyCronfun()
        break
      default:
        break
    }
  }

  secondMultipleChange = (valArr) => {
    let seconds = '*'
    if (valArr.length > 0) {
      seconds = ''
      valArr.forEach(val => {
        seconds += `${val},`
      })
      seconds = seconds.slice(0, -1)
    }
    let data = Object.assign({}, this.state.second, { specificSpecific: valArr, secondText: this.state.second.cronEvery === '3' ? seconds : this.state.secondText })
    this.setState({ ...this.state, secondText: data.secondText, second: data })
  }

  /* minutes */
  minutesOnChange =(val) => {
    let minutes = '*'
    let cronEvery = val.target ? val.target.value : val
    let data = Object.assign({}, this.state.minutes, { cronEvery: cronEvery.toString() })
    switch (cronEvery.toString()) {
      case '1':
        this.setState({
          ...this.state,
          minutesText: '*',
          minutesValue: cronEvery,
          hourValue: null,
          dayValue: null,
          hourText: '*',
          dayText: '*',
          weekText: '?',
          minutes: data,
        }, () => {
          this.prettyCronfun()
        })
        break
      case '2':
        minutes = `${this.state.minutes.incrementIncrement}/${this.state.minutes.incrementStart}`
        this.setState({
          ...this.state,
          minutesText: minutes,
          minutesValue: cronEvery,
          minutes: data,
        }, () => {
          this.prettyCronfun()
        })
        break
      case '3':
        if (this.state.minutes.specificSpecific.length > 0) {
          minutes = ''
          this.state.minutes.specificSpecific.forEach(val => {
            minutes += `${val},`
          })
          minutes = minutes.slice(0, -1)
        }
        this.setState({
          ...this.state,
          minutesText: minutes,
          minutesValue: cronEvery,
          minutes: data,
        }, () => {
          this.prettyCronfun()
        })
        break
      case '4':
        minutes = `${this.state.minutes.rangeStart}-${this.state.minutes.rangeEnd}`
        this.setState({
          ...this.state,
          minutesText: minutes,
          minutesValue: cronEvery,
          minutes: data,
        }, () => {
          this.prettyCronfun()
        })
        break
      default:
        break
    }
  }

  minutesMultipleChange = (valArr) => {
    let minutes = '*'
    if (valArr.length > 0) {
      minutes = ''
      valArr.forEach(val => {
        minutes += `${val},`
      })
      minutes = minutes.slice(0, -1)
    }
    let data = Object.assign({}, this.state.minutes, { specificSpecific: valArr, minutesText: this.state.minutes.cronEvery === '3' ? minutes : this.state.minutesText })
    this.setState({ ...this.state, minutesText: data.minutesText, minutes: data }, () => { this.prettyCronfun() })
  }

  /* hour */
  hourOnChange =(val) => {
    let hour = '*'
    let cronEvery = val.target ? val.target.value : val
    let data = Object.assign({}, this.state.hour, { cronEvery: cronEvery.toString() })
    switch (cronEvery.toString()) {
      case '1':
        this.setState({
          ...this.state,
          hourText: '*',
          hourValue: cronEvery,
          minutesText: this.state.minutesText === '*' ? '0' : this.state.minutesText,
          minutesValue: this.state.minutesText === '*' ? null : this.state.minutesValue,
          dayValue: null,
          hour: data,
        }, () => {
          this.prettyCronfun()
        })
        break
      case '2':
        hour = `${this.state.hour.incrementIncrement}/${this.state.hour.incrementStart}`
        this.setState({
          ...this.state,
          hourText: hour,
          hourValue: cronEvery,
          minutesText: this.state.minutesText === '*' ? '0' : this.state.minutesText,
          minutesValue: this.state.minutesText === '*' ? null : this.state.minutesValue,
          hour: data,
        }, () => {
          this.prettyCronfun()
        })
        break
      case '3':
        if (this.state.hour.specificSpecific.length > 0) {
          hour = ''
          this.state.hour.specificSpecific.forEach(val => {
            hour += `${val},`
          })
          hour = hour.slice(0, -1)
        }
        this.setState({
          ...this.state,
          hourText: hour,
          hourValue: cronEvery,
          minutesText: this.state.minutesText === '*' ? '0' : this.state.minutesText,
          minutesValue: this.state.minutesText === '*' ? null : this.state.minutesValue,
          hour: data,
        }, () => {
          this.prettyCronfun()
        })
        break
      case '4':
        hour = `${this.state.hour.rangeStart}-${this.state.hour.rangeEnd}`
        this.setState({
          ...this.state,
          hourText: hour,
          hourValue: cronEvery,
          minutesText: this.state.minutesText === '*' ? '0' : this.state.minutesText,
          minutesValue: this.state.minutesText === '*' ? null : this.state.minutesValue,
          hour: data,
        }, () => {
          this.prettyCronfun()
        })
        break
      default:
        break
    }
  }

  hourMultipleChange = (valArr) => {
    let hour = '*'
    if (valArr.length > 0) {
      hour = ''
      valArr.forEach(val => {
        hour += `${val},`
      })
      hour = hour.slice(0, -1)
    }
    let data = Object.assign({}, this.state.hour, { specificSpecific: valArr, hourText: this.state.hour.cronEvery === '3' ? hour : this.state.hourText })
    this.setState({ ...this.state, hourText: data.hourText, hour: data }, () => { this.prettyCronfun() })
  }

  /* day */
  dayOnChange = (val) => {
    let weeks = '?'
    let day = '*'
    let cronEvery = val.target ? val.target.value : val
    let data = Object.assign({}, this.state.day, { cronEvery: cronEvery.toString() })
    switch (cronEvery.toString()) {
      case '1':
        this.setState({
          ...this.state,
          dayText: '*',
          day: data,
          minutesText: this.state.minutesText === '*' ? '0' : this.state.minutesText,
          minutesValue: this.state.minutesText === '*' ? null : this.state.minutesValue,
          hourText: this.state.hourText === '*' ? '0' : this.state.hourText,
          hourValue: this.state.hourText === '*' ? null : this.state.hourValue,
          dayValue: cronEvery,
          monthValue: null,
          weekText: '?',
        }, () => {
          this.prettyCronfun()
        })
        break
      case '2':
        this.setState({
          ...this.state,
          dayText: '*',
          day: data,
          minutesText: this.state.minutesText === '*' ? '0' : this.state.minutesText,
          minutesValue: this.state.minutesText === '*' ? null : this.state.minutesValue,
          hourText: this.state.hourText === '*' ? '0' : this.state.hourText,
          hourValue: this.state.hourText === '*' ? null : this.state.hourValue,
          weekText: `${this.state.week.incrementIncrement}/${this.state.week.incrementStart}`,
          dayValue: cronEvery,
        }, () => {
          this.prettyCronfun()
        })
        break
      case '3':
        this.setState({
          ...this.state,
          weekText: '?',
          day: data,
          minutesText: this.state.minutesText === '*' ? '0' : this.state.minutesText,
          minutesValue: this.state.minutesText === '*' ? null : this.state.minutesValue,
          hourText: this.state.hourText === '*' ? '0' : this.state.hourText,
          hourValue: this.state.hourText === '*' ? null : this.state.hourValue,
          dayText: `${this.state.day.incrementIncrement}/${this.state.day.incrementStart}`,
          dayValue: cronEvery,
        }, () => {
          this.prettyCronfun()
        })
        break
      case '4':
        if (this.state.week.specificSpecific.length > 0) {
          weeks = ''
          this.state.week.specificSpecific.forEach(val => {
            weeks += `${val},`
          })
          weeks = weeks.slice(0, -1)
        }
        this.setState({
          ...this.state,
          weekText: weeks,
          day: data,
          minutesText: this.state.minutesText === '*' ? '0' : this.state.minutesText,
          minutesValue: this.state.minutesText === '*' ? null : this.state.minutesValue,
          hourText: this.state.hourText === '*' ? '0' : this.state.hourText,
          hourValue: this.state.hourText === '*' ? null : this.state.hourValue,
          dayValue: cronEvery,
          dayText: '?',
        }, () => {
          this.prettyCronfun()
        })
        break
      case '5':
        if (this.state.day.specificSpecific.length > 0) {
          day = ''
          this.state.day.specificSpecific.forEach(val => {
            day += `${val},`
          })
          day = day.slice(0, -1)
        }
        this.setState({
          ...this.state,
          weekText: '?',
          day: data,
          minutesText: this.state.minutesText === '*' ? '0' : this.state.minutesText,
          minutesValue: this.state.minutesText === '*' ? null : this.state.minutesValue,
          hourText: this.state.hourText === '*' ? '0' : this.state.hourText,
          hourValue: this.state.hourText === '*' ? null : this.state.hourValue,
          dayValue: cronEvery,
          dayText: day,
        }, () => {
          this.prettyCronfun()
        })
        break
      case '6':
        this.setState({
          ...this.state,
          weekText: '?',
          day: data,
          minutesText: this.state.minutesText === '*' ? '0' : this.state.minutesText,
          minutesValue: this.state.minutesText === '*' ? null : this.state.minutesValue,
          hourText: this.state.hourText === '*' ? '0' : this.state.hourText,
          hourValue: this.state.hourText === '*' ? null : this.state.hourValue,
          dayValue: cronEvery,
          dayText: 'L',
        }, () => {
          this.prettyCronfun()
        })
        break
      case '7':
        this.setState({
          ...this.state,
          weekText: '?',
          day: data,
          minutesText: this.state.minutesText === '*' ? '0' : this.state.minutesText,
          minutesValue: this.state.minutesText === '*' ? null : this.state.minutesValue,
          hourText: this.state.hourText === '*' ? '0' : this.state.hourText,
          hourValue: this.state.hourText === '*' ? null : this.state.hourValue,
          dayValue: cronEvery,
          dayText: 'LW',
        }, () => {
          this.prettyCronfun()
        })
        break
      case '8':
        this.setState({
          ...this.state,
          weekText: '?',
          day: data,
          minutesText: this.state.minutesText === '*' ? '0' : this.state.minutesText,
          minutesValue: this.state.minutesText === '*' ? null : this.state.minutesValue,
          hourText: this.state.hourText === '*' ? '0' : this.state.hourText,
          hourValue: this.state.hourText === '*' ? null : this.state.hourValue,
          dayValue: cronEvery,
          dayText: this.state.day.cronLastSpecificDomDay,
        }, () => {
          this.prettyCronfun()
        })
        break
      case '9':
        this.setState({
          ...this.state,
          weekText: '?',
          day: data,
          minutesText: this.state.minutesText === '*' ? '0' : this.state.minutesText,
          minutesValue: this.state.minutesText === '*' ? null : this.state.minutesValue,
          hourText: this.state.hourText === '*' ? '0' : this.state.hourText,
          hourValue: this.state.hourText === '*' ? null : this.state.hourValue,
          dayValue: cronEvery,
          dayText: `L-${this.state.day.cronDaysBeforeEomMinus}`,
        }, () => {
          this.prettyCronfun()
        })
        break
      case '10':
        this.setState({
          ...this.state,
          weekText: '?',
          day: data,
          minutesText: this.state.minutesText === '*' ? '0' : this.state.minutesText,
          minutesValue: this.state.minutesText === '*' ? null : this.state.minutesValue,
          hourText: this.state.hourText === '*' ? '0' : this.state.hourText,
          hourValue: this.state.hourText === '*' ? null : this.state.hourValue,
          dayValue: cronEvery,
          dayText: `${this.state.day.cronDaysBeforeEomMinus}W`,
        }, () => {
          this.prettyCronfun()
        })
        break
      case '11':
        this.setState({
          ...this.state,
          dayText: '?',
          day: data,
          minutesText: this.state.minutesText === '*' ? '0' : this.state.minutesText,
          minutesValue: this.state.minutesText === '*' ? null : this.state.minutesValue,
          hourText: this.state.hourText === '*' ? '0' : this.state.hourText,
          hourValue: this.state.hourText === '*' ? null : this.state.hourValue,
          weekText: `${this.state.week.cronNthDayDay}#${this.state.week.cronNthDayNth}`,
          dayValue: cronEvery,
        }, () => {
          this.prettyCronfun()
        })
        break
      default:
        break
    }
  }

  weekChange = (val) => {
    let weeks = '?'
    weeks = `${this.state.week.incrementIncrement}/${val}`
    let data = Object.assign({}, this.state.week, { weekText: this.state.day.cronEvery === '2' ? weeks : this.state.weekText, incrementStart: val })
    this.setState({ ...this.state, weekText: data.weekText, week: data }, () => { this.prettyCronfun() })
  }

  weekSpeChange = (valArr) => {
    let weeks = '?'
    if (valArr.length > 0) {
      weeks = ''
      valArr.forEach(val => {
        weeks += `${val},`
      })
      weeks = weeks.slice(0, -1)
    }
    let data = Object.assign({}, this.state.week, { specificSpecific: valArr, weekText: this.state.day.cronEvery === '4' ? weeks : this.state.weekText })
    this.setState({ ...this.state, weekText: data.weekText, week: data }, () => { this.prettyCronfun() })
  }

  daySpeChange = (valArr) => {
    let day = '*'
    if (valArr.length > 0) {
      day = ''
      valArr.forEach(val => {
        day += `${val},`
      })
      day = day.slice(0, -1)
    }
    let data = Object.assign({}, this.state.day, { specificSpecific: valArr, dayText: this.state.day.cronEvery === '5' ? day : this.state.dayText })
    this.setState({ ...this.state, dayText: data.dayText, day: data }, () => { this.prettyCronfun() })
  }

  dayLaChange = (val) => {
    let data = Object.assign({}, this.state.day, { dayText: this.state.day.cronEvery === '8' ? val : this.state.dayText, cronLastSpecificDomDay: val })
    this.setState({ ...this.state, dayText: data.dayText, day: data }, () => { this.prettyCronfun() })
  }

  weekLaChange = (val) => {
    let data = Object.assign({}, this.state.week, { weekText: this.state.day.cronEvery === '11' ? `${val}#${this.state.week.cronNthDayNth}` : this.state.weekText, cronNthDayDay: val })
    this.setState({ ...this.state, weekText: data.weekText, week: data }, () => { this.prettyCronfun() })
  }

  /* month */
  monthOnChange = (val) => {
    let month = '*'
    let cronEvery = val.target ? val.target.value : val
    let data = Object.assign({}, this.state.month, { cronEvery: cronEvery.toString() })
    switch (cronEvery.toString()) {
      case '1':
        this.setState({
          ...this.state,
          monthText: '*',
          month: data,
          minutesText: this.state.minutesText === '*' ? '0' : this.state.minutesText,
          minutesValue: this.state.minutesText === '*' ? null : this.state.minutesValue,
          hourText: this.state.hourText === '*' ? '0' : this.state.hourText,
          hourValue: this.state.hourText === '*' ? null : this.state.hourValue,
          dayText: this.state.dayText === '*' ? '1' : this.state.dayText,
          dayValue: this.state.dayText === '*' && this.state.weekText === '*' ? null : this.state.dayValue,
          monthValue: cronEvery,
        }, () => {
          this.prettyCronfun()
        })
        break
      case '2':
        month = `${this.state.month.incrementIncrement}/${this.state.month.incrementStart}`
        this.setState({
          ...this.state,
          monthText: month,
          month: data,
          minutesText: this.state.minutesText === '*' ? '0' : this.state.minutesText,
          minutesValue: this.state.minutesText === '*' ? null : this.state.minutesValue,
          hourText: this.state.hourText === '*' ? '0' : this.state.hourText,
          hourValue: this.state.hourText === '*' ? null : this.state.hourValue,
          dayText: this.state.dayText === '*' ? '1' : this.state.dayText,
          dayValue: this.state.dayText === '*' ? null : this.state.dayValue,
          monthValue: cronEvery,
        }, () => {
          this.prettyCronfun()
        })
        break
      case '3':
        if (this.state.month.specificSpecific.length > 0) {
          month = ''
          this.state.month.specificSpecific.forEach(val => {
            month += `${val},`
          })
          month = month.slice(0, -1)
        }
        this.setState({
          ...this.state,
          monthText: month,
          month: data,
          minutesText: this.state.minutesText === '*' ? '0' : this.state.minutesText,
          minutesValue: this.state.minutesText === '*' ? null : this.state.minutesValue,
          hourText: this.state.hourText === '*' ? '0' : this.state.hourText,
          hourValue: this.state.hourText === '*' ? null : this.state.hourValue,
          dayText: this.state.dayText === '*' ? '1' : this.state.dayText,
          dayValue: this.state.dayText === '*' ? null : this.state.dayValue,
          monthValue: cronEvery,
        }, () => {
          this.prettyCronfun()
        })
        break
      case '4':
        month = `${this.state.month.rangeStart}-${this.state.month.rangeEnd}`
        this.setState({
          ...this.state,
          monthText: month,
          month: data,
          minutesText: this.state.minutesText === '*' ? '0' : this.state.minutesText,
          minutesValue: this.state.minutesText === '*' ? null : this.state.minutesValue,
          hourText: this.state.hourText === '*' ? '0' : this.state.hourText,
          hourValue: this.state.hourText === '*' ? null : this.state.hourValue,
          dayText: this.state.dayText === '*' ? '1' : this.state.dayText,
          dayValue: this.state.dayText === '*' ? null : this.state.dayValue,
          monthValue: cronEvery,
        }, () => {
          this.prettyCronfun()
        })
        break
      default:
        break
    }
  }

  monthMultipleChange = (valArr) => {
    let month = '*'
    if (valArr.length > 0) {
      month = ''
      valArr.forEach(val => {
        month += `${val},`
      })
      month = month.slice(0, -1)
    }
    let data = Object.assign({}, this.state.month, { specificSpecific: valArr, monthText: this.state.month.cronEvery === '3' ? month : this.state.monthText })
    this.setState({ ...this.state, monthText: data.monthText, month: data }, () => { this.prettyCronfun() })
  }

  /* year */
  yearOnChange = (val) => {
    let year = '*'
    let cronEvery = val.target ? val.target.value : val
    let data = Object.assign({}, this.state.year, { cronEvery: cronEvery.toString() })
    switch (cronEvery.toString()) {
      case '1':
        this.setState({
          ...this.state,
          yearText: '*',
          year: data,
        })
        break
      case '2':
        year = `${this.state.year.incrementStart}/${this.state.year.incrementIncrement}`
        this.setState({
          ...this.state,
          yearText: year,
          year: data,
        })
        break
      case '3':
        if (this.state.year.specificSpecific.length > 0) {
          year = ''
          this.state.year.specificSpecific.forEach(val => {
            year += `${val},`
          })
          year = year.slice(0, -1)
        }
        this.setState({
          ...this.state,
          yearText: year,
          year: data,
        })
        break
      case '4':
        year = `${this.state.year.rangeStart}-${this.state.year.rangeEnd}`
        this.setState({
          ...this.state,
          yearText: year,
          year: data,
        })
        break
      default:
        break
    }
  }

  yearMultipleChange = (valArr) => {
    let year = '*'
    if (valArr.length > 0) {
      year = ''
      valArr.forEach(val => {
        year += `${val},`
      })
      year = year.slice(0, -1)
    }
    let data = Object.assign({}, this.state.year, { specificSpecific: valArr, yearText: this.state.year.cronEvery === '3' ? year : this.state.yearText })
    this.setState({ ...this.state, yearText: data.yearText, year: data })
  }

  CronInputChange = (e) => {
    e.persist()
    if (e.target && e.target.value !== 'undefined') {
      this.setState({
        ...this.state,
        cornText: e.target.value,
        prettyCronText: prettyCron.toString(e.target.value),
      }, () => {
        if (!cronValidate(e.target.value)) {
          this.setState({
            ...this.state,
            cornFormat: true,
          })
          this.props.saveDisabled()
        } else {
          this.setState({
            ...this.state,
            cornFormat: false,
          })
          this.props.changeCron(e.target.value)
        }
      })
    }
  }

  next() {
    const current = this.state.current + 1
    this.setState({ current })
  }

  prev() {
    const current = this.state.current - 1
    this.setState({ current })
  }

  activeKeyChange(key) {
    this.setState({ activeKey: key })
  }

  render() {
    const { current } = this.state
    const children = []
    for (let i = 0; i < 60; i++) {
      children.push(<Option key={i}>{i}</Option>)
    }
    const childrenHour = []
    for (let i = 0; i < 24; i++) {
      childrenHour.push(<Option key={i}>{i}</Option>)
    }
    const weekAry = [{ val: 1, label: 'Sunday' }, { val: 2, label: 'Monday' }, { val: 3, label: 'Tuesday' }, { val: 4, label: 'Wednesday' }, { val: 5, label: 'Thursday' }, { val: 6, label: 'Friday' }, { val: 7, label: 'Saturday' }]
    const childrenWeekAry = []
    for (let i = 0; i < 7; i++) {
      childrenWeekAry.push(<Option key={weekAry[i].val}>{weekAry[i].label}</Option>)
    }

    const weekSpeAry = [{ val: 'SUN', label: 'Sunday' }, { val: 'MON', label: 'Monday' }, { val: 'TUE', label: 'Tuesday' }, { val: 'WED', label: 'Wednesday' }, { val: 'THU', label: 'Thursday' }, { val: 'FRI', label: 'Friday' }, { val: 'SAT', label: 'Saturday' }]
    const childrenSpeWeekAry = []
    for (let i = 0; i < 7; i++) {
      childrenSpeWeekAry.push(<Option key={weekSpeAry[i].val}>{weekSpeAry[i].label}</Option>)
    }

    const childrenSpeMonthAry = []
    for (let i = 1; i < 32; i++) {
      childrenSpeMonthAry.push(<Option key={i}>{i}</Option>)
    }

    const weekLAry = [{ val: '1L', label: 'Sunday' }, { val: '2L', label: 'Monday' }, { val: '3L', label: 'Tuesday' }, { val: '4L', label: 'Wednesday' }, { val: '5L', label: 'Thursday' }, { val: '6L', label: 'Friday' }, { val: '7L', label: 'Saturday' }]
    const childrenLAWeekAry = []
    for (let i = 0; i < 7; i++) {
      childrenLAWeekAry.push(<Option key={weekLAry[i].val}>{weekLAry[i].label}</Option>)
    }

    const childrenMonth = []
    for (let i = 1; i < 13; i++) {
      childrenMonth.push(<Option key={i}>{i}</Option>)
    }

    const childrenYear = []
    for (let i = 2019; i < 2119; i++) {
      childrenYear.push(<Option key={i}>{i}</Option>)
    }
    return (
      <div>
        <Tabs activeKey={this.state.activeKey} onChange={(key) => this.activeKeyChange(key)} type="card">
          <TabPane tab="Cron" key="Cron">
            <div style={{ minHeight: '160px' }}>
              <div style={{ width: '60%', display: 'flex', alignItems: 'center' }}>
                <label style={{ fontSize: '18px', marginRight: '10px' }}>Cron</label>
                <Input placeholder="Cron" value={this.state.cornText} onChange={this.CronInputChange} />
              </div>
            </div>
          </TabPane>
          <TabPane tab="Generate Cron" key="generateCron">
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 0 }}>
                <Steps direction="vertical" size="small" current={current}>
                  {steps.map(item => (
                    <Step key={item.title} title={item.title} />
                  ))}
                </Steps>
              </div>
              <div className="steps-content">{
                steps[current].content == 'minutes'
                  ? <div style={{ padding: '20px 0px 10px 20px', marginLeft: '110px', marginTop: '20px', background: '#fafafa', border: '1px dashed #e9e9e9' }}>
                  <RadioGroup onChange={this.minutesOnChange} value={this.state.minutesValue}>
                    <Row>
                      <Col className={style.cronClo} span={24}>
                        <Radio value={1}>Every minutes</Radio>
                      </Col>
                      <Col className={style.cronClo} span={24}>
                        <Radio value={2}>
                          Every
                          <InputNumber className={style.cronInput} min={1} max={60} disabled={!(this.state.minutes.cronEvery === '2')} defaultValue={this.state.minutes.incrementStart} onChange={(val) => { let data = Object.assign({}, this.state.minutes, { incrementStart: val, minutesText: this.state.minutes.cronEvery === '2' ? `${this.state.minutes.incrementIncrement}/${val}` : this.state.minutesText }); this.setState({ ...this.state, minutesText: data.minutesText, minutes: data }, () => { this.prettyCronfun() }) }}></InputNumber>
                          minutes(s) starting at minutes
                          <InputNumber className={style.cronInput} min={1} max={59} disabled={!(this.state.minutes.cronEvery === '2')} defaultValue={this.state.minutes.incrementIncrement} onChange={(val) => { let data = Object.assign({}, this.state.minutes, { incrementIncrement: val, minutesText: this.state.minutes.cronEvery === '2' ? `${val}/${this.state.minutes.incrementStart}` : this.state.minutesText }); this.setState({ ...this.state, minutesText: data.minutesText, minutes: data }, () => { this.prettyCronfun() }) }}></InputNumber>
                        </Radio>
                      </Col>
                      <Col className={style.cronClo} span={24}>
                        <Radio value={3}>
                          Specific minutes (choose one or many)
                        </Radio>
                        <div className={style.cronInput} style={{ display: 'inline-block', width: '300px' }}>
                          <Select
                            mode="multiple"
                            style={{ width: '100%' }}
                            placeholder="Please select"
                            disabled={!(this.state.minutes.cronEvery === '3')}
                            onChange={this.minutesMultipleChange}
                          >
                            {children}
                          </Select>
                        </div>
                      </Col>
                      <Col className={style.cronClo} span={24}>
                        <Radio value={4}>
                          Every minutes between
                          <InputNumber className={style.cronInput} min={0} max={this.state.minutes.rangeEnd} defaultValue={this.state.minutes.rangeStart} disabled={!(this.state.minutes.cronEvery === '4')} onChange={(val) => { let data = Object.assign({}, this.state.minutes, { rangeStart: val, minutesText: this.state.minutes.cronEvery === '4' ? `${val}-${this.state.minutes.rangeEnd}` : this.state.minutesText }); this.setState({ ...this.state, minutesText: data.minutesText, minutes: data }, () => { this.prettyCronfun() }) }}></InputNumber>
                          and
                          <InputNumber className={style.cronInput} min={this.state.minutes.rangeStart} max={59} defaultValue={this.state.minutes.rangeEnd} disabled={!(this.state.minutes.cronEvery === '4')} onChange={(val) => { let data = Object.assign({}, this.state.minutes, { rangeEnd: val, minutesText: this.state.minutes.cronEvery === '4' ? `${this.state.minutes.rangeStart}-${val}` : this.state.minutesText }); this.setState({ ...this.state, minutesText: data.minutesText, minutes: data }, () => { this.prettyCronfun() }) }}></InputNumber>
                        </Radio>
                      </Col>
                    </Row>
                  </RadioGroup>
                </div> : ''}
                {steps[current].content == 'hour'
                  ? <div style={{ padding: '20px 0px 10px 20px', marginLeft: '110px', marginTop: '20px', background: '#fafafa', border: '1px dashed #e9e9e9' }}>
                  <RadioGroup onChange={this.hourOnChange} value={this.state.hourValue}>
                    <Row>
                      <Col className={style.cronClo} span={24}>
                        <Radio value={1}>Every hour</Radio>
                      </Col>
                      <Col className={style.cronClo} span={24}>
                        <Radio value={2}>
                          Every
                          <InputNumber className={style.cronInput} min={0} max={23} disabled={!(this.state.hour.cronEvery === '2')} defaultValue={this.state.hour.incrementStart} onChange={(val) => { let data = Object.assign({}, this.state.hour, { incrementStart: val, hourText: this.state.hour.cronEvery === '2' ? `${this.state.hour.incrementIncrement}/${val}` : this.state.hourText }); this.setState({ ...this.state, hourText: data.hourText, hour: data }, () => { this.prettyCronfun() }) }}></InputNumber>
                          hour(s) starting at hour
                          <InputNumber className={style.cronInput} min={0} max={23} disabled={!(this.state.hour.cronEvery === '2')} defaultValue={this.state.hour.incrementIncrement} onChange={(val) => { let data = Object.assign({}, this.state.hour, { incrementIncrement: val, hourText: this.state.hour.cronEvery === '2' ? `${val}/${this.state.hour.incrementStart}` : this.state.hourText }); this.setState({ ...this.state, hourText: data.hourText, hour: data }, () => { this.prettyCronfun() }) }}></InputNumber>
                        </Radio>
                      </Col>
                      <Col className={style.cronClo} span={24}>
                        <Radio value={3}>
                          Specific hour (choose one or many)
                        </Radio>
                        <div className={style.cronInput} style={{ display: 'inline-block', width: '300px' }}>
                          <Select
                            mode="multiple"
                            style={{ width: '100%' }}
                            placeholder="Please select"
                            disabled={!(this.state.hour.cronEvery === '3')}
                            onChange={this.hourMultipleChange}
                          >
                            {childrenHour}
                          </Select>
                        </div>
                      </Col>
                      <Col className={style.cronClo} span={24}>
                        <Radio value={4}>
                          Every hour between
                          <InputNumber className={style.cronInput} min={0} max={this.state.hour.rangeEnd} defaultValue={this.state.hour.rangeStart} disabled={!(this.state.hour.cronEvery === '4')} onChange={(val) => { let data = Object.assign({}, this.state.hour, { rangeStart: val, hourText: this.state.hour.cronEvery === '4' ? `${val}-${this.state.hour.rangeEnd}` : this.state.hourText }); this.setState({ ...this.state, hourText: data.hourText, hour: data }, () => { this.prettyCronfun() }) }}></InputNumber>
                          and
                          <InputNumber className={style.cronInput} min={this.state.hour.rangeStart} max={23} defaultValue={this.state.hour.rangeEnd} disabled={!(this.state.hour.cronEvery === '4')} onChange={(val) => { let data = Object.assign({}, this.state.hour, { rangeEnd: val, hourText: this.state.hour.cronEvery === '4' ? `${this.state.hour.rangeStart}-${val}` : this.state.hourText }); this.setState({ ...this.state, hourText: data.hourText, hour: data }, () => { this.prettyCronfun() }) }}></InputNumber>
                        </Radio>
                      </Col>
                    </Row>
                  </RadioGroup>
                </div> : ''}
                {steps[current].content == 'day'
                  ? <div style={{ padding: '20px 0px 10px 20px', marginLeft: '110px', marginTop: '20px', background: '#fafafa', border: '1px dashed #e9e9e9' }}>
                  <RadioGroup onChange={this.dayOnChange} value={this.state.dayValue}>
                    <Row>
                      <Col className={style.cronClo} span={24}>
                        <Radio value={1}>Every day</Radio>
                      </Col>
                      <Col className={style.cronClo} span={24}>
                        <Radio value={2}>
                          Every
                          <InputNumber className={style.cronInput} min={1} max={7} disabled={!(this.state.day.cronEvery === '2')} defaultValue={this.state.day.incrementIncrement} onChange={(val) => { let data = Object.assign({}, this.state.week, { incrementIncrement: val, weekText: this.state.day.cronEvery === '2' ? `${val}/${this.state.week.incrementStart}` : this.state.weekText }); this.setState({ ...this.state, weekText: data.weekText, week: data }, () => { this.prettyCronfun() }) }}></InputNumber>
                          day(s) starting on
                          <Select className={style.cronInput} defaultValue="1" disabled={!(this.state.day.cronEvery === '2')} style={{ width: 120 }} onChange={this.weekChange}>
                            {childrenWeekAry}
                          </Select>
                        </Radio>
                      </Col>
                      <Col className={style.cronClo} span={24}>
                        <Radio value={3}>
                          Every
                          <InputNumber className={style.cronInput} min={1} max={31} disabled={!(this.state.day.cronEvery === '3')} defaultValue={this.state.day.incrementIncrement} onChange={(val) => { let data = Object.assign({}, this.state.day, { incrementIncrement: val, dayText: this.state.day.cronEvery === '3' ? `${this.state.day.incrementStart}/${val}` : this.state.dayText }); this.setState({ ...this.state, weekText: '?', day: data, dayText: data.dayText }, () => { this.prettyCronfun() }) }}></InputNumber>
                          day(s) starting at the
                          <InputNumber className={style.cronInput} min={1} max={31} disabled={!(this.state.day.cronEvery === '3')} defaultValue={this.state.day.incrementStart} onChange={(val) => { let data = Object.assign({}, this.state.day, { incrementStart: val, dayText: this.state.day.cronEvery === '3' ? `${val}/${this.state.day.incrementIncrement}` : this.state.dayText }); this.setState({ ...this.state, weekText: '?', day: data, dayText: data.dayText }, () => { this.prettyCronfun() }) }}></InputNumber>
                        </Radio>
                      </Col>
                      <Col className={style.cronClo} span={24}>
                        <Radio value={4}>
                          Specific day of week (choose one or many)
                        </Radio>
                        <div className={style.cronInput} style={{ display: 'inline-block', width: '300px' }}>
                          <Select
                            mode="multiple"
                            style={{ width: '100%' }}
                            placeholder="Please select"
                            onChange={this.weekSpeChange}
                            disabled={!(this.state.day.cronEvery === '4')}
                          >
                            {childrenSpeWeekAry}
                          </Select>
                        </div>
                      </Col>
                      <Col className={style.cronClo} span={24}>
                        <Radio value={5}>
                          Specific day of month (choose one or many)
                        </Radio>
                        <div className={style.cronInput} style={{ display: 'inline-block', width: '300px' }}>
                          <Select
                            mode="multiple"
                            style={{ width: '100%' }}
                            placeholder="Please select"
                            onChange={this.daySpeChange}
                            disabled={!(this.state.day.cronEvery === '5')}
                          >
                            {childrenSpeMonthAry}
                          </Select>
                        </div>
                      </Col>
                      {/* <Col span={24}>
                        <Radio value={6}>
                          On the last day of the month
                        </Radio>
                      </Col>
                      <Col span={24}>
                        <Radio value={7}>
                          On the last weekday of the month
                        </Radio>
                      </Col> */}
                      {/* <Col span={24}>
                        <Radio value={8}>
                          On the last
                          <Select
                              defaultValue="1L"
                              disabled={!(this.state.day.cronEvery === '8')}
                              style={{ width: 180 }}
                              onChange={this.dayLaChange}
                            >
                              {childrenLAWeekAry}
                          </Select>
                          of the month
                        </Radio>
                      </Col> */}
                      {/* <Col span={24}>
                        <Radio value={9}>
                          <InputNumber min={1} max={31} disabled={!(this.state.day.cronEvery === '9')} defaultValue={this.state.day.cronDaysBeforeEomMinus} onChange={(val)=>{let data = Object.assign({}, this.state.day, { cronDaysBeforeEomMinus: val, dayText: this.state.day.cronEvery === '9' ? `L-${val}` : this.state.dayText }); this.setState({...this.state, weekText: '?', day: data, dayText: data.dayText }, () => { this.prettyCronfun() })}}></InputNumber>
                          day(s) before the end of the month
                        </Radio>
                      </Col> */}
                      {/* <Col className={style.cronClo} span={24}>
                        <Radio value={10}>
                          Nearest weekday (Monday to Friday) to the
                          <InputNumber className={style.cronInput} min={1} max={31} disabled={!(this.state.day.cronEvery === '10')} defaultValue={this.state.day.cronDaysNearestWeekday} onChange={(val)=>{let data = Object.assign({}, this.state.day, { cronDaysNearestWeekday: val, dayText: this.state.day.cronEvery === '10' ? `${val}W` : this.state.dayText }); this.setState({...this.state, weekText: '?', day: data, dayText: data.dayText }, () => { this.prettyCronfun() })}}></InputNumber>
                          of the month
                        </Radio>
                      </Col> */}
                      {/* <Col span={24}>
                        <Radio value={11}>
                          On the
                          <InputNumber min={1} max={5} disabled={!(this.state.day.cronEvery === '11')} defaultValue={this.state.week.cronNthDayDay} onChange={(val)=>{let data = Object.assign({}, this.state.week, { cronNthDayNth: val, weekText: this.state.day.cronEvery === '11' ? `${this.state.week.cronNthDayDay}#${val}` : this.state.weekText }); this.setState({...this.state, dayText: '?', week: data, weekText: data.weekText }, () => { this.prettyCronfun() })}}></InputNumber>
                          <Select
                            defaultValue={this.state.week.cronNthDayDay}
                            disabled={!(this.state.day.cronEvery === '11')}
                            onChange={this.weekLaChange}
                            style={{ width: 180 }}
                          >
                            {childrenWeekAry}
                          </Select>
                          of the month
                        </Radio>
                      </Col> */}
                    </Row>
                  </RadioGroup>
                </div> : ''}
                {steps[current].content == 'month'
                  ? <div style={{ padding: '20px 0px 10px 20px', marginLeft: '110px', marginTop: '20px', background: '#fafafa', border: '1px dashed #e9e9e9' }}>
                  <RadioGroup onChange={this.monthOnChange} value={this.state.monthValue}>
                    <Row>
                      <Col className={style.cronClo} span={24}>
                        <Radio value={1}>Every month</Radio>
                      </Col>
                      <Col className={style.cronClo} span={24}>
                        <Radio value={2}>
                          Every
                          <InputNumber className={style.cronInput} min={1} max={12} disabled={!(this.state.month.cronEvery === '2')} defaultValue={this.state.month.incrementStart} onChange={(val) => { let data = Object.assign({}, this.state.month, { incrementStart: val, monthText: this.state.month.cronEvery === '2' ? `${this.state.month.incrementIncrement}/${val}` : this.state.monthText }); this.setState({ ...this.state, monthText: data.monthText, month: data }, () => { this.prettyCronfun() }) }}></InputNumber>
                          month(s) starting at month
                          <InputNumber className={style.cronInput} min={1} max={12} disabled={!(this.state.month.cronEvery === '2')} defaultValue={this.state.month.incrementIncrement} onChange={(val) => { let data = Object.assign({}, this.state.month, { incrementIncrement: val, monthText: this.state.month.cronEvery === '2' ? `${val}/${this.state.month.incrementStart}` : this.state.monthText }); this.setState({ ...this.state, monthText: data.monthText, month: data }, () => { this.prettyCronfun() }) }}></InputNumber>
                        </Radio>
                      </Col>
                      <Col className={style.cronClo} span={24}>
                        <Radio value={3}>
                          Specific month (choose one or many)
                        </Radio>
                        <div className={style.cronInput} style={{ display: 'inline-block', width: '300px' }}>
                          <Select
                            mode="multiple"
                            style={{ width: '100%' }}
                            placeholder="Please select"
                            disabled={!(this.state.month.cronEvery === '3')}
                            onChange={this.monthMultipleChange}
                          >
                            {childrenMonth}
                          </Select>
                        </div>
                      </Col>
                      <Col className={style.cronClo} span={24}>
                        <Radio value={4}>
                          Every month between
                          <InputNumber className={style.cronInput} min={1} max={this.state.month.rangeEnd} defaultValue={this.state.month.rangeStart} disabled={!(this.state.month.cronEvery === '4')} onChange={(val) => { let data = Object.assign({}, this.state.month, { rangeStart: val, monthText: this.state.month.cronEvery === '4' ? `${val}-${this.state.month.rangeEnd}` : this.state.monthText }); this.setState({ ...this.state, monthText: data.monthText, month: data }, () => { this.prettyCronfun() }) }}></InputNumber>
                          and
                          <InputNumber className={style.cronInput} min={this.state.month.rangeStart} max={12} defaultValue={this.state.month.rangeEnd} disabled={!(this.state.month.cronEvery === '4')} onChange={(val) => { let data = Object.assign({}, this.state.month, { rangeEnd: val, monthText: this.state.month.cronEvery === '4' ? `${this.state.month.rangeStart}-${val}` : this.state.monthText }); this.setState({ ...this.state, monthText: data.monthText, month: data }, () => { this.prettyCronfun() }) }}></InputNumber>
                        </Radio>
                      </Col>
                    </Row>
                  </RadioGroup>
                </div> : ''}
                </div>
              <div style={{ margin: '20px', textAlign: 'right' }}>
                {current > 0 && (
                  <Button style={{ marginRight: 8 }} onClick={() => this.prev()}>
                    Previous
                  </Button>
                )}
                {current < steps.length - 1 && (
                  <Button type="primary" onClick={() => this.next()}>
                    Next
                  </Button>
                )}
                {current === steps.length - 1 && (
                  <Button type="primary" onClick={() => { this.setState({ activeKey: 'Cron' }) }}>
                    Done
                  </Button>
                )}
              </div>
            </div>
          </TabPane>
        </Tabs>
        { this.state.cornFormat
          ? <div style={{ padding: '10px', background: 'rgba(212, 75, 10, 0.2)' }}>
            <span>Cron expression format error</span>
          </div>
          : <div style={{ padding: '10px', background: '#ebf2f6' }}>
            <span>{this.state.prettyCronText}</span>
          </div>
        }
      </div>
    )
  }
}

ReactCron.propTypes = {
  changeCron: PropTypes.func,
}

export default ReactCron
