import React from 'react'
import { Icon } from 'antd'
import styles from './index.less'

const Notfound = () =>
  <div className="content-inner">
    <div className={styles.notfound}>
      <Icon type="frown-o" />
      <h1>404 Not Found Path : {window.__pathname_prefix__}</h1>
    </div>
  </div>

export default Notfound
