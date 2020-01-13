import React from 'react'
import PropTypes from 'prop-types'
import { Row, Col, Button } from 'antd'
import { Filter } from '../../components/index'
import HostBulkActions from './HostBulkActions'

class HostFilter extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isAllExpanded: false,
      HostBulkActionsProps: {
        bulkDeleteHost: this.bulkDeleteHost,
      },
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

  bulkDeleteHost = () => {
    this.props.dispatch({
      type: 'host/autoDeleteNode',
      payload: {
        selectedHostRows: this.props.selectedHostRows,
      },
    })
  }

  render() {
    const { location, onSearch, stateOption, fieldOption, selectedHostRows } = this.props
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
        <Col lg={16} md={14} sm={24} xs={24}>
          <div style={{ display: 'flex' }}>
            <Button size="large" type="primary" onClick={() => this.toggleExpand()}>{this.state.isAllExpanded ? 'Collapse' : 'Expand'} All</Button>
            <HostBulkActions {...this.state.HostBulkActionsProps} selectedRows={selectedHostRows} />
          </div>
        </Col>
        <Col lg={8} md={10} sm={24} xs={24} style={{ marginBottom: 16 }}>
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
  selectedHostRows: PropTypes.array,
  selectedRows: PropTypes.array,
  expandAll: PropTypes.func,
  collapseAll: PropTypes.func,
  dispatch: PropTypes.func,
}

export default HostFilter
