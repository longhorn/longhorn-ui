import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import app from '../main'
export default (modelGenerate) => (Component) => {
  class registryModel extends React.Component {
    constructor(props) {
      super(props)
      this.namespace = this.props.id
      this.ConnectedComponent = function () {}
    }

    UNSAFE_componentWillMount() {
      app.model(modelGenerate(this.namespace))
      this.ConnectedComponent = connect((state) => ({ ...state[this.namespace] }))(Component)
    }

    componentWillUnmount() {
      app.unmodel(this.namespace)
    }

    render() {
      let ConnectedComponent = this.ConnectedComponent
      return <ConnectedComponent {...this.props}></ConnectedComponent>
    }
  }
  registryModel.propTypes = {
    id: PropTypes.string,
  }
  return registryModel
}
