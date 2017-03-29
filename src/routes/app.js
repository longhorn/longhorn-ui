import React, { PropTypes } from 'react'
import { connect } from 'dva'
import { Layout } from '../components'
import { classnames, config } from '../utils'
import { Helmet } from 'react-helmet'
import '../components/skin.less'
const { Header, Bread, styles } = Layout

const App = ({ children, location }) => {
  const headerProps = {
    location,
  }

  return (
    <div>
      <Helmet>
        <title>Longhorn</title>
        <link rel="icon" href={config.logoSrc} type="image/x-icon" />
        {config.iconFontUrl ? <script src={config.iconFontUrl}></script> : ''}
      </Helmet>
      <div className={classnames(styles.layout, { [styles.fold]: true }, { [styles.withnavbar]: true })}>
        <div className={styles.main}>
          <Header {...headerProps} />
          <Bread location={location} />
          <div className={styles.container}>
            <div className={styles.content}>
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

App.propTypes = {
  children: PropTypes.element.isRequired,
  location: PropTypes.object,
}

export default connect()(App)
