import React from 'react'
import PropTypes from 'prop-types'
import { Button, Modal, Tooltip } from 'antd'
import style from './HostBulkActions.less'
import { withTranslation } from 'react-i18next'

const confirm = Modal.confirm

function bulkActions({ selectedRows, bulkDeleteHost, commandKeyDown, showBulkEditNodeModal, t }) {
  const handleClick = (action) => {
    switch (action) {
      case 'delete':
        if (commandKeyDown) {
          bulkDeleteHost(selectedRows)
        } else {
          confirm({
            title: t('hostBulkActions.confirmDelete', { nodes: selectedRows.map(item => item.name).join(', ') }),
            onOk() {
              bulkDeleteHost(selectedRows)
            },
          })
        }
        break
      case 'editNode':
        showBulkEditNodeModal()
        break
      default:
    }
  }

  const allActions = [
    { key: 'delete',
      name: t('hostBulkActions.actions.delete'),
      disabled() {
        return (selectedRows.length === 0 || selectedRows.some((item) => {
          if (item && item.status && item.status.key !== 'down') {
            return true
          }
          return false
        }))
      },
    },
    { key: 'editNode',
      name: t('hostBulkActions.actions.editNode'),
      disabled() {
        return selectedRows.length === 0 || selectedRows.some((item) => {
          if (item && item.status && item.status.key === 'down') {
            return true
          }
          return selectedRows[0].allowScheduling !== item.allowScheduling
        })
      },
    },
  ]

  const message = selectedRows.length === 0 || selectedRows.some((item) => {
    if (item && item.status && item.status.key !== 'down') {
      return true
    }
    return false
  }) ? t('hostBulkActions.messages.deleteFirst') : ''

  return (
    <div className={style.bulkActions}>
      { allActions.map(item => {
        return (
          <div key={item.key}>
            &nbsp;
            <Tooltip title={`${item.key === 'delete' ? message : ''}`}>
              <Button size="large" type="primary" disabled={item.disabled()} onClick={() => handleClick(item.key)}>{ item.name }</Button>
            </Tooltip>
          </div>
        )
      }) }
    </div>
  )
}

bulkActions.propTypes = {
  t: PropTypes.func,
  selectedRows: PropTypes.array,
  bulkDeleteHost: PropTypes.func,
  showBulkEditNodeModal: PropTypes.func,
  commandKeyDown: PropTypes.bool,
}

export default withTranslation()(bulkActions)
