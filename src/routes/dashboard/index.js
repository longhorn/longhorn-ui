import React, { PropTypes } from 'react'
import { connect } from 'dva'
import { Row, Col } from 'antd'
import { NumberCard } from './components'

function Dashboard({ host, volume }) {
  const hostNum = host.data.length
  const volumeNum = volume.data.length

  const numbers = [{
    icon: 'laptop',
    color: '#64ea91',
    title: 'Hosts',
    number: hostNum,
    linkTo: '/host',
  }, {
    icon: 'database',
    color: '#d897eb',
    title: 'Volumes',
    number: volumeNum,
    linkTo: '/volume',
  },
  ]

  const numberCards = numbers.map((item, key) => <Col key={key} lg={12} md={12}>
    <NumberCard {...item} />
  </Col>)

  return (
    <div>
      <Row gutter={24}>
        {numberCards}
      </Row>
    </div>
  )
}

Dashboard.propTypes = {
  host: PropTypes.object,
  volume: PropTypes.object,
}

export default connect(({ host, volume }) => ({ host, volume }))(Dashboard)
