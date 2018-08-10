import React, { PropTypes } from 'react'
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

  onPieEnter= (data, index) => {
    if (this.props.clickable) {
      this.setState({
        activeIndex: index,
        activeData: data,
      })
    }
  }

  onPieOut= () => {
    if (this.props.clickable) {
      this.setState({
        activeIndex: -1,
        activeData: {},
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
    const { title, subTitle, data = [], colors = [], width = 300, height = 300, onClick = f => f, clickable = false, empty = 'No Data' } = this.props
    const chartOption = { outerRadius: '96%', innerRadius: '82%', startAngle: 225, endAngle: -45, paddingAngle: 0, onMouseDown: onClick, onMouseEnter: this.onPieEnter, onMouseOut: this.onPieOut }
    if (data.every(item => item.value === 0)) {
      return (
        <div className={styles.resourceChart}>
        <PieChart width={width} height={width}>
          <Pie dataKey="value"
            data={[{ name: 'empty data', value: 1 }]}
            cx={width / 2}
            cy={height / 2}
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
        <PieChart width={width} height={width} style={{ position: 'absolute' }} >
          {this.state.activeIndex > -1 ? this.renderActiveShape(this.state.activeData) : null}
        </PieChart>
        <PieChart width={width} height={width}>
          <Pie dataKey="value"
            data={data}
            cx={width / 2}
            cy={height / 2}
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
  height: PropTypes.number,
  onClick: PropTypes.func,
  clickable: PropTypes.bool,
  empty: PropTypes.string,
}

export default ResourceChart
