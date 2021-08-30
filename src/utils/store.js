class Store {
  constructor(storage, namespace = '') {
    this.storage = storage
    this.namespacePrefix = namespace
  }

  get(key, optionalDefaultValue) {
    let data = this.storage.getItem(this.namespacePrefix + key)
    return this.deserialize(data, optionalDefaultValue)
  }

  set(key, value) {
    if (value === undefined) {
      return this.storage.removeItem(this.namespacePrefix + key)
    }
    this.storage.setItem(this.namespacePrefix + key, this.serialize(value))
    return value
  }

  remove(key) {
    this.storage.remove(this.namespacePrefix + key)
  }

  clearAll() {
    this.storage.clear()
  }

  serialize = (obj) => {
    return JSON.stringify(obj)
  }

  deserialize = (strVal, defaultVal) => {
    if (!strVal) {
      return defaultVal
    }
    let val = ''
    try {
      val = JSON.parse(strVal)
    } catch (e) {
      val = strVal
    }
    return (val !== undefined ? val : defaultVal)
  }

  hasNamespace(namespace) {
    return (this.namespace === namespace)
  }
}

const store = new Store(window.localStorage, '_longhorn-ui_')

export function saveSorter(key, sorter) {
  store.set(key, { field: sorter.field, order: sorter.order, columnKey: sorter.columnKey })
}

export function getSorter(key) {
  return store.get(key)
}

export function setSortOrder(columns, sorter) {
  if (sorter && sorter.field && sorter.order) {
    const column = columns.find(item => item.key === sorter.columnKey)
    if (column) {
      column.sortOrder = sorter.order
    }
  } else {
    columns.forEach(col => {
      col.sortOrder = false
    })
  }
}

export function getBackupVolumeName(search) {
  if (search && search.field === 'volumeName' && search.keyword) {
    return search.keyword
  }
  return ''
}

export default store
