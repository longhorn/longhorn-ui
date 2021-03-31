import React from 'react'
import PropTypes from 'prop-types'
import { Breadcrumb, Icon } from 'antd'
import styles from './Bread.less'
import { menu } from '../../utils'
import { LinkTo } from '../../components'


let pathSet = []
const getPathSet = function (menuArray, parentPath) {
  parentPath = parentPath || '/'
  menuArray.forEach(item => {
    pathSet[(parentPath + item.key).replace(/\//g, '-').hyphenToHump()] = {
      path: parentPath + item.key,
      name: item.name,
      icon: item.icon || '',
      clickable: item.clickable === undefined,
    }
    if (item.child) {
      // setting This menu is a bit special
      // the page below the menu is actually the root page
      // but for nav it is a subset of setting nav.
      // So it needs to be handled in a special way
      if (item.key === 'setting') {
        getPathSet(item.child, '/')
      }
      getPathSet(item.child, `${parentPath}${item.key}/`)
    }
  })
}

getPathSet(menu)

function Bread({ location }) {
  let pathNames = []
  const paths = {}

  location.pathname
    .replace(/^\+/, '')
    .split('/')
    .filter((item) => item)
    .forEach((item, key) => {
      if (key > 0) {
        pathNames.push((`${pathNames[key - 1]}-${item}`).hyphenToHump())
      } else {
        pathNames.push(item.length > 0 ? (`-${item}`).hyphenToHump() : 'Dashboard')
      }
      paths[key] = item
    })

  const breads = pathNames.map((item, key) => {
    if (!(item in pathSet)) {
      pathSet[item] = {
        name: paths[key],
        clickable: true,
        path: location.pathname.split('/').splice(0, key + 2).join('/'),
      }
    }
    return (
      <Breadcrumb.Item key={key}>
        {pathSet[item].icon
          ? <Icon type={pathSet[item].icon} />
          : ''}
        {
          ((pathNames.length - 1 === key) || !pathSet[item].clickable) ? <span>{pathSet[item].name}</span> : <LinkTo to={{ pathname: pathSet[item].path }}>
              {pathSet[item].name}
            </LinkTo>
        }
      </Breadcrumb.Item>
    )
  })

  return (
    <div className={styles.bread}>
      <Breadcrumb>
        {breads}
      </Breadcrumb>
    </div>
  )
}

Bread.propTypes = {
  location: PropTypes.object,
}

export default Bread
