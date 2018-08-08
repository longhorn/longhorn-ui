import React, { PropTypes } from 'react'
import { PieChart, Pie, Cell, Label } from 'recharts'
import styles from './resourceChart.less'

function ResourceChart({ title, subTitle, data = [], colors = [], width = 300, height = 300, onClick = f => f, clickable, empty = 'No Data' }) {
  const chartOption = { outerRadius: '100%', innerRadius: '85%', startAngle: 225, endAngle: -45, paddingAngle: 0, onMouseDown: onClick }
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
      <PieChart width={width} height={width}>
        <Pie dataKey="value"
          data={data}
          cx={width / 2}
          cy={height / 2}
          {...chartOption}
        >
          {
            data.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} style={{ cursor: clickable ? 'pointer' : 'auto' }} />)
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
