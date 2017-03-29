import React, { PropTypes } from 'react'
import { connect } from 'dva'
import { Row, Col, Card } from 'antd'
import { NumberCard, Resource, EventLogs } from './components'
import styles from './index.less'

function Dashboard({ dashboard }) {
  const { numbers } = dashboard
  const numberCards = numbers.map((item, key) => <Col key={key} lg={6} md={12}>
    <NumberCard {...item} />
  </Col>)
  const resource = {
    total: 5000,
    used: 3500,
    data: [
      { name: 'Used', value: 3500 },
      { name: 'Available', value: 1500 },
    ],
  }

  const eventLogs = {
    data: [
      { date: '3/14/2017 5:24:44pm', type: 'info', text: 'Info replica replia-0scb43-1 rebuild complete' },
      { date: '3/14/2017 5:24:44pm', type: 'error', text: 'Error replica replica-0scb43-1 rebuild faliure' },
      { date: '3/14/2017 5:24:44pm', type: 'info', text: 'Info replica replia-0scb43-1 rebuild complete' },
      { date: '3/14/2017 5:24:44pm', type: 'info', text: 'Info replica replia-0scb43-1 rebuild complete' },
      { date: '3/14/2017 5:24:44pm', type: 'info', text: 'Info replica replia-0scb43-1 rebuild complete' },
    ],
  }

  return (
    <div>
      <Row gutter={24}>
        {numberCards}
        <Col lg={8} md={24} className={styles.col}>
          <Card bordered={false}>
            <Resource {...resource} />
          </Card>
        </Col>
        <Col lg={16} md={24}>
          <Card title="Event Logs" bordered={false}>
            <EventLogs {...eventLogs} />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

Dashboard.propTypes = {
  dashboard: PropTypes.object,
}

export default connect(({ dashboard }) => ({ dashboard }))(Dashboard)
