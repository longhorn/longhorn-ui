import React, { PropTypes } from 'react'
import { connect } from 'dva'
import { Row, Col } from 'antd'
import { NumberCard } from './components'

function Dashboard({ host, volume, loading }) {
  const hostNum = host.data.length
  const volumeNum = volume.data.length
  const { host: hostLoading, volume: volumeLoading } = loading.models

  const numbers = [{
    icon: 'laptop',
    color: '#64ea91',
    title: 'Nodes',
    number: hostNum,
    linkTo: '/node',
    loading: hostLoading,
  }, {
    icon: 'database',
    color: '#d897eb',
    title: 'Volumes',
    number: volumeNum,
    linkTo: '/volume',
    loading: volumeLoading,
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
  loading: PropTypes.object,
}

export default connect(({ host, volume, loading }) => ({ host, volume, loading }))(Dashboard)
