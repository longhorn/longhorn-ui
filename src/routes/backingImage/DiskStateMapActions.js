import React from 'react'
import PropTypes from 'prop-types'
import { Button, Modal } from 'antd'
import { withTranslation } from 'react-i18next'

const confirm = Modal.confirm

function DiskStateMapActions({ selectedRows, deleteButtonDisabled, deleteButtonLoading, deleteDisksOnBackingImage, t }) {
  const deleteButtonClick = () => {
    confirm({
      width: 'fit-content',
      title: (
          <>
            <p>{t('diskStateMapActions.modal.delete.title')}</p>
            <ul>
              {selectedRows.map(item => <li>{item.disk}</li>)}
            </ul>
          </>
      ),
      onOk() {
        deleteDisksOnBackingImage(selectedRows)
      },
    })
  }

  const deleteButtonProps = {
    disabled: deleteButtonDisabled,
    loading: deleteButtonLoading,
    onClick: deleteButtonClick,
    type: 'danger',
  }

  return (
    <Button {...deleteButtonProps}>{t('diskStateMapActions.button.cleanUp')}</Button>
  )
}

DiskStateMapActions.propTypes = {
  selectedRows: PropTypes.array,
  deleteButtonDisabled: PropTypes.bool,
  deleteButtonLoading: PropTypes.bool,
  deleteDisksOnBackingImage: PropTypes.func,
  t: PropTypes.func,
}

export default withTranslation()(DiskStateMapActions)
