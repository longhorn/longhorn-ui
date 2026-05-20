import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Helmet } from 'react-helmet'
import { ConfigProvider } from 'antd'
import enUS from 'antd/lib/locale-provider/en_US'
import ruRU from 'antd/lib/locale-provider/ru_RU'
import { Layout } from '../components'
import { classnames, config } from '../utils'

import '../i18n'

const { Header, Bread, Footer, styles } = Layout

let blur = (bl) => {
  return bl ? 'lh-blur' : ''
}

const antdLocales = {
  ru: ruRU,
  en: enUS,
}

const App = ({ children, dispatch, location, app }) => {
  const { menuPopoverVisible, isNavbar, lang } = app

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const urlLang = params.get('lang')

    if (urlLang && Object.keys(antdLocales).includes(urlLang)) {
      dispatch({
        type: 'app/setLang',
        payload: urlLang
      })
    }
  }, [location.search])

  const headerProps = {
    location,
    menuPopoverVisible,
    isNavbar,
    switchMenuPopover() {
      dispatch({ type: 'app/switchMenuPopver' })
    }
  }

  return (
    <ConfigProvider locale={antdLocales[lang]}>
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
    </ConfigProvider>
  )
}

App.propTypes = {
  children: PropTypes.element.isRequired,
  app: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
}

export default connect(({ app, loading }) => ({ app, loading: loading.models.app }))(App)
