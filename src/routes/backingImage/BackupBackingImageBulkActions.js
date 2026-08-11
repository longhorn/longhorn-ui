import React from 'react'
import PropTypes from 'prop-types'
import { Button, Modal } from 'antd'
import { withTranslation } from 'react-i18next'

const confirm = Modal.confirm

function bulkActions({ bbiSelectedRows, deleteBackupBackingImages, t }) {
  const handleClick = (action) => {
    const count = bbiSelectedRows.length
    switch (action) {
      case 'delete':
        confirm({
          width: 'fit-content',
          okText: t('common.delete'),
          okType: 'danger',
          title: (<>
                    <p>{t('backupBackingImageBulkActions.modal.delete.title', { count })}</p>
                    <ul>
                      {bbiSelectedRows.map(item => <li>{item.name}</li>)},
                    </ul>
                  </>),
          onOk() {
            deleteBackupBackingImages(bbiSelectedRows)
          },
        })
        break
      default:
    }
  }

  const allActions = [
    { key: 'delete', name: t('common.delete'), disabled() { return bbiSelectedRows.length === 0 } },
  ]

  return (
    <div style={{ display: 'flex' }}>
      { allActions.map(item => {
        return (
          <div key={item.key} style={{ marginRight: '10px' }}>
            <Button size="large" type="primary" disabled={item.disabled()} onClick={() => handleClick(item.key)}>{ item.name }</Button>
          </div>
        )
      }) }
    </div>
  )
}

bulkActions.propTypes = {
  bbiSelectedRows: PropTypes.array,
  deleteBackupBackingImages: PropTypes.func,
  t: PropTypes.func.isRequired,
}

export default withTranslation()(bulkActions)
