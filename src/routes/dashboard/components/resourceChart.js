import React from 'react'
import PropTypes from 'prop-types'
import { PieChart, Pie, Cell, Label, Sector } from 'recharts'
import classnames from 'classnames'
import styles from './resourceChart.less'

class ResourceChart extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      activeIndex: -1,
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { activeIndex } = nextProps
    this.setState({ activeIndex })
  }

  onPieEnter= (data, index) => {
    if (this.props.clickable) {
      this.setState({
        activeIndex: index,
      })
    }
  }

  onPieOut= () => {
    if (this.props.clickable) {
      this.setState({
        activeIndex: -1,
      })
    }
  }

  renderActiveShape = (p) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = p
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius - 4}
          outerRadius={outerRadius + 4}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </g>
    )
  }

  render() {
    const { title, subTitle, data = [], colors = [], width = 300, onClick = f => f, clickable = false, empty = 'No Data' } = this.props
    const backChartOption = { outerRadius: '96%', innerRadius: '82%', startAngle: 225, endAngle: -45, paddingAngle: 0, onMouseDown: onClick, activeIndex: this.state.activeIndex, activeShape: this.renderActiveShape }
    const chartOption = { outerRadius: '96%', innerRadius: '82%', startAngle: 225, endAngle: -45, paddingAngle: 0, onMouseDown: onClick, onMouseEnter: this.onPieEnter, onMouseLeave: this.onPieOut }
    if (data.every(item => item.value === 0)) {
      return (
        <div className={styles.resourceChart}>
        <PieChart width={width} height={width}>
          <Pie dataKey="value"
            data={[{ name: 'empty data', value: 1 }]}
            cx={width / 2}
            cy={width / 2}
            {...chartOption}
          >
            <Cell fill="#dee1e3" />
            <Label position="center" style={{ fontSize: '26px', fontWeight: 600, fill: '#dee1e3' }}>
            {empty}
            </Label>
          </Pie>
        </PieChart>
      </div>
      )
    }
    return (
      <div className={styles.resourceChart}>
        <PieChart width={width} height={width} style={{ position: 'absolute' }}>
          <Pie dataKey="value"
            data={data}
            cx={width / 2}
            cy={width / 2}
            {...backChartOption}
          >
            {
              data.map((entry, index) => <Cell strokeWidth={0} key={entry.name} fill={colors[index % colors.length]} />)
            }
          </Pie>
        </PieChart>
        <PieChart width={width} height={width}>
          <Pie dataKey="value"
            data={data}
            cx={width / 2}
            cy={width / 2}
            {...chartOption}
          >
            {
              data.map((entry, index) => <Cell className={classnames({ [styles.clickable]: clickable })} strokeWidth={0} key={entry.name} fill={colors[index % colors.length]} />)
            }
            <Label position="center" dy={-20} style={{ fontSize: '36px', fontWeight: 600, fill: '#707070' }}>
              {title}
            </Label>
            <Label position="center" dy={20} style={{ fill: '#99a3a8' }}>
              {subTitle}
            </Label>
          </Pie>
        </PieChart>
      </div>
    )
  }
}

ResourceChart.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  subTitle: PropTypes.string,
  colors: PropTypes.array,
  data: PropTypes.array,
  width: PropTypes.number,
  onClick: PropTypes.func,
  clickable: PropTypes.bool,
  empty: PropTypes.string,
  activeIndex: PropTypes.number,
}

export default ResourceChart
