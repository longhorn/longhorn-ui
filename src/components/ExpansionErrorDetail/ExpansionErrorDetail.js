import React from 'react'
import PropTypes from 'prop-types'
import { Alert } from 'antd'

class ExpansionErrorDetail extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      showExpansionErrorVisible: false,
      title: 'Click to view error details',
    }
  }

  toggleExpansionError = () => {
    this.setState({
      ...this.state,
      showExpansionErrorVisible: !this.state.showExpansionErrorVisible,
      title: !this.state.showExpansionErrorVisible ? 'Click to close error details' : 'Click to view error details',
    })
  }

  render() {
    return (<div>
      <div style={{ color: '#1890ff', cursor: 'pointer' }} onClick={() => { this.toggleExpansionError() }}>Last expansion failed at {this.props.lastExpansionFailedAt}, {this.state.title}</div>
      {this.state.showExpansionErrorVisible ? <Alert
        message={this.props.content}
        type="error"
      /> : ''}
    </div>)
  }
}

ExpansionErrorDetail.propTypes = {
  content: PropTypes.string,
  lastExpansionFailedAt: PropTypes.string,
}

export default ExpansionErrorDetail
