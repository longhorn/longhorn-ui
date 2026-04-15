import React from 'react'
import PropTypes from 'prop-types'
import { Button, Modal } from 'antd'
import { withTranslation } from 'react-i18next'

const confirm = Modal.confirm

function bulkActions({ selectedRows, deleteorphanedData, t }) {
  const handleClick = (action) => {
    switch (action) {
      case 'delete':
        confirm({
          title: t('orphanedDataActions.modal.delete.title', { name: selectedRows.map(item => item.name).join(',') }),
          width: 760,
          onOk() {
            deleteorphanedData(selectedRows)
          },
        })
        break
      default:
    }
  }

  const allActions = [
    { key: 'delete', name: t('common.delete'), disabled() { return selectedRows.length === 0 } },
  ]

  return (
    <div>
      { allActions.map(item => {
        return (
          <div key={item.key}>
            &nbsp;
            <Button size="large" type="primary" disabled={item.disabled()} onClick={() => handleClick(item.key)}>{ item.name }</Button>
          </div>
        )
      }) }
    </div>
  )
}

bulkActions.propTypes = {
  selectedRows: PropTypes.array,
  deleteorphanedData: PropTypes.func,
  t: PropTypes.func,
}

export default withTranslation()(bulkActions)
