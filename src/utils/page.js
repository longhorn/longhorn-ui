export function pagination(key) {
  if (key === 'systemBackupSize' || key === 'SystemRestoreSize') {
    return {
      defaultPageSize: window.__page_size_object__[key] || 3, // eslint-disable-line
      showSizeChanger: true,
      pageSizeOptions: ['3', '5', '10'],
      onShowSizeChange: (current, size) => {
        let pageSizeObject = window.__page_size_object__ // eslint-disable-line
        if (pageSizeObject) {
          pageSizeObject[key] = size
        }
        window.sessionStorage.setItem('pageSizeCollection', JSON.stringify(pageSizeObject))
      },
    }
  }
  return {
    defaultPageSize: window.__page_size_object__[key], // eslint-disable-line
    showSizeChanger: true,
    pageSizeOptions: ['10', '30', '50', '100'],
    onShowSizeChange: (current, size) => {
      let pageSizeObject = window.__page_size_object__ // eslint-disable-line
      if (pageSizeObject) {
        pageSizeObject[key] = size
      }
      window.sessionStorage.setItem('pageSizeCollection', JSON.stringify(pageSizeObject))
    },
  }
}
