import React, { PropTypes } from 'react'
import { Row, Col, Button } from 'antd'
import { Filter } from '../../components/index'
import styles from './HostFilter.less'

class HostFilter extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isAllExpanded: false,
    }
  }
  toggleExpand = (isAllExpanded) => {
    if (isAllExpanded !== undefined) {
      this.setState({ isAllExpanded })
      return
    }
    const { expandAll = f => f, collapseAll = f => f } = this.props
    if (this.state.isAllExpanded) {
      collapseAll()
    } else {
      expandAll()
    }
    this.setState({ isAllExpanded: !this.state.isAllExpanded })
  }
  render() {
    const { location, onSearch, stateOption, fieldOption } = this.props
    const searchGroupProps = {
      location,
      stateOption,
      fieldOption,
      onSearch: (value) => {
        onSearch(value)
      },
    }
    return (
      <Row gutter={24}>
        <Col lg={18} md={16} sm={24} xs={24}>
          <Button size="large" className={styles.expandOrCollapseButton} onClick={() => this.toggleExpand()}>{this.state.isAllExpanded ? 'Collapse' : 'Expand'} All</Button>
        </Col>
        <Col lg={6} md={8} sm={24} xs={24} style={{ marginBottom: 16 }}>
          <Filter {...searchGroupProps} />
        </Col>
      </Row>
    )
  }
}

HostFilter.propTypes = {
  onSearch: PropTypes.func,
  location: PropTypes.object,
  stateOption: PropTypes.array,
  fieldOption: PropTypes.array,
  expandAll: PropTypes.func,
  collapseAll: PropTypes.func,
}

export default HostFilter
