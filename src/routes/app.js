import React, { PropTypes } from 'react'
import { connect } from 'dva'
import { Layout } from '../components'
import { classnames, config } from '../utils'
import { Helmet } from 'react-helmet'
import enUS from 'antd/lib/locale-provider/en_US'
import { LocaleProvider } from 'antd'
const { Header, Bread, Footer, styles } = Layout

let blur = (bl) => {
  return bl ? 'lh-blur' : ''
}

const App = ({ children, dispatch, location, app }) => {
  const { menuPopoverVisible, isNavbar } = app
  const headerProps = {
    location,
    menuPopoverVisible,
    isNavbar,
    switchMenuPopover() {
      dispatch({ type: 'app/switchMenuPopver' })
    },
  }

  return (
    <LocaleProvider locale={enUS}>
      <div className={blur(app.blur)}>
        <Helmet>
          <title>Longhorn</title>
          <link rel="icon" href={config.logoSrc} type="image/x-icon" />
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
            <Footer />
          </div>
        </div>
      </div>
    </LocaleProvider>
  )
}

App.propTypes = {
  children: PropTypes.element.isRequired,
  app: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
}

export default connect(({ app, loading }) => ({ app, loading: loading.models.app }))(App)
