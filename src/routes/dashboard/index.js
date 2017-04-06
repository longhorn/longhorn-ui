import React, { PropTypes } from 'react'
import { connect } from 'dva'
import { Row, Col, Card } from 'antd'
import { NumberCard, EventLogs } from './components'

function Dashboard({ host, volume }) {
  const hostNum = host.data.length
  const volumeNum = volume.data.length

  const numbers = [{
    icon: 'laptop',
    color: '#64ea91',
    title: 'Hosts',
    number: hostNum,
  }, {
    icon: 'database',
    color: '#d897eb',
    title: 'Volumes',
    number: volumeNum,
  },
  ]

  const numberCards = numbers.map((item, key) => <Col key={key} lg={12} md={12}>
    <NumberCard {...item} />
  </Col>)

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
        <Col md={24}>
          <Card title="Event Logs" bordered={false}>
            <EventLogs {...eventLogs} />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

Dashboard.propTypes = {
  host: PropTypes.object,
  volume: PropTypes.object,
}

export default connect(({ host, volume }) => ({ host, volume }))(Dashboard)
