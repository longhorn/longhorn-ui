import React from 'react'
import PropTypes from 'prop-types'
import { Button, Row, Col } from 'antd'
import { Filter } from '../../components/index'

const VolumeFilter = ({
  location,
  onSearch,
  onAdd,
  stateOption,
  fieldOption,
}) => {
  const FilterProps = {
    location,
    stateOption,
    fieldOption,
    onSearch: (value) => {
      onSearch(value)
    },
  }

  return (
    <Row gutter={24}>
      <Col lg={6} md={8} sm={16} xs={24} className="filter-input">
        <Filter {...FilterProps} />
      </Col>

      <Col lg={{ offset: 10, span: 8 }} md={{ offset: 8, span: 8 }} sm={{ offset: 0, span: 8 }} xs={{ offset: 0, span: 24 }} style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button size="large" type="primary" onClick={onAdd}>Create Volume</Button>
      </Col>
    </Row>
  )
}

VolumeFilter.propTypes = {
  onSearch: PropTypes.func,
  onAdd: PropTypes.func,
  location: PropTypes.object,
  stateOption: PropTypes.array,
  fieldOption: PropTypes.array,
  nodeRedundancyOption: PropTypes.array,
  engineImageUpgradableOption: PropTypes.array,
}

export default VolumeFilter
