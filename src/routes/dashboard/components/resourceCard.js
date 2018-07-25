import React, { PropTypes } from 'react'
import { Card, Icon } from 'antd'
import { PieChart, Pie, Cell } from 'recharts'
import styles from './resourceCard.less'

function ResourceCard({ title, data, colors, chartType, details, loading }) {
  const chartOption = chartType === 'doughnut' ? { outerRadius: '100%', innerRadius: '80%' } : { outerRadius: '100%' }
  return (
    <Card className={styles.resourceCard} bordered={false} bodyStyle={{ padding: 0 }} title={<span className={styles.title}>{title} {loading ? <Icon type="loading" /> : null}</span>}>
      <div className={styles.resourceBody}>
      <div className={styles.chart}>
          <PieChart width={100} height={100}>
            <Pie dataKey="value"
              data={data}
              cx={50}
              cy={50}
              outerRadius="100%"
              {...chartOption}
            >
              {
                data.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)
              }
            </Pie>
          </PieChart>
        </div>
        <div className={styles.content}>
          <div className={styles.detail}>
          {details.map((entry) => {
            return (
              <div key={entry.name} style={{ color: entry.color, display: 'table-row' }}>
                <div style={{ display: 'table-cell', minWidth: '100px' }}>{entry.name}: </div>
                <div style={{ display: 'table-cell' }}>{entry.value}</div>
              </div>
            )
          })}
          </div>
        </div>
      </div>
    </Card>
  )
}

ResourceCard.propTypes = {
  colors: PropTypes.array,
  title: PropTypes.string,
  data: PropTypes.array,
  details: PropTypes.array,
  chartType: PropTypes.string,
  loading: PropTypes.bool,
}

export default ResourceCard
