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
      commandKeyDown: false,
      HostBulkActionsProps: {
        bulkDeleteHost: this.bulkDeleteHost,
        showBulkEditNodeModal: this.showBulkEditNodeModal,
      },
    }
  }

  componentDidMount() {
    window.addEventListener('keydown', this.onkeydown)
    window.addEventListener('keyup', this.onkeyup)
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.onkeydown)
    window.removeEventListener('keyup', this.onkeyup)
  }

  onkeyup = () => {
    this.setState({
      ...this.state,
      commandKeyDown: false,
    })
  }

  onkeydown = (e) => {
    if ((e.keyCode === 91 || e.keyCode === 17) && !this.state.commandKeyDown) {
      this.setState({
        ...this.state,
        commandKeyDown: true,
      })
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

  showBulkEditNodeModal = () => {
    this.props.dispatch({
      type: 'host/showBulkEditNodeModal',
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
            <HostBulkActions {...this.state.HostBulkActionsProps} commandKeyDown={this.state.commandKeyDown} selectedRows={selectedHostRows} />
          </div>
        </Col>
        <Col lg={8} md={10} sm={24} xs={24}>
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
