import React from 'react'
import PropTypes from 'prop-types'
import { Alert } from 'antd'
import { withTranslation } from 'react-i18next'

class ExpansionErrorDetail extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      showExpansionErrorVisible: false,
    }
  }

  toggleExpansionError = () => {
    this.setState({
      ...this.state,
      showExpansionErrorVisible: !this.state.showExpansionErrorVisible,
    })
  }

  render() {
    const { t } = this.props
    const title = this.state.showExpansionErrorVisible
      ? t('expansionErrorDetail.clickToCloseErrorDetails')
      : t('expansionErrorDetail.clickToViewErrorDetails')

    return (<div>
      <div style={{ color: '#1890ff', cursor: 'pointer' }} onClick={() => { this.toggleExpansionError() }}>{t('expansionErrorDetail.lastExpansionFailedAt', { lastExpansionFailedAt: this.props.lastExpansionFailedAt })} {title}</div>
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
  t: PropTypes.func.isRequired,
}

export default withTranslation()(ExpansionErrorDetail)
