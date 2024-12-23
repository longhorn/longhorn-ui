import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Form, Button, Modal, Select, Icon } from 'antd'
import { hasReadyBackingDisk, diskStatusColorMap } from '../../utils/status'
import styles from './BackingImageBulkActions.less'

function BulkActions({
  selectedRows,
  backupProps,
  deleteBackingImages,
  downloadSelectedBackingImages,
  backupSelectedBackingImages,
  backupTargets = [],
  form = {},
}) {
  const [isBackupModalVisible, setIsBackupModalVisible] = useState(false)

  const { getFieldDecorator, getFieldValue } = form
  const { backupTargetAvailable } = backupProps
  const readyColor = diskStatusColorMap.ready
  const readyTextStyle = {
    display: 'inline-block',
    width: 'max-content',
    padding: '0 4px',
    color: '#27AE5F',
    border: `1px solid ${readyColor.color}`,
    backgroundColor: readyColor.bg,
    textTransform: 'capitalize',
  }
  const getImageLabel = selectedRows.length === 1 ? 'image' : 'images'
  const readyImages = selectedRows.filter((row) => hasReadyBackingDisk(row))

  const handleDelete = () => {
    const title = (
      <>
        <p>
          Are you sure you want to delete the following {selectedRows.length} backing {getImageLabel}?
        </p>
        <ul>
          {selectedRows.map((item) => (
            <li key={item.name}>{item.name}</li>
          ))}
        </ul>
      </>
    )
    Modal.confirm({
      width: 'fit-content',
      okText: 'Delete',
      okType: 'danger',
      title,
      content: null,
      onOk: () => deleteBackingImages(selectedRows),
    })
  }

  const handleDownload = () => {
    const downloadableImages = selectedRows.filter((row) => hasReadyBackingDisk(row))

    const title = (
      <>
        <p>
          The following backing {getImageLabel} with <strong style={readyTextStyle}>Ready</strong> status disk will be downloaded.
        </p>
        <ul>
          {downloadableImages.map((item) => (
            <li key={item.name}>{item.name}</li>
          ))}
        </ul>
        <p>
          Note: You need to allow <strong>Automatic Downloads</strong> in browser settings to download multiple files at once.
        </p>
      </>
    )
    Modal.confirm({
      width: 'fit-content',
      okText: 'Download',
      title,
      content: null,
      onOk: () => downloadSelectedBackingImages(downloadableImages),
    })
  }

  const handleBackup = () => {
    setIsBackupModalVisible(true)
  }

  const handleBackupOk = () => {
    const backupTarget = backupTargets.find((bkTarget) => bkTarget.name === getFieldValue('backupTargetName'))
    const backupImages = readyImages.map((backingImage) => ({
      ...backingImage,
      backingImageName: backingImage.name,
      backupTargetName: backupTarget.name,
      backupTargetURL: backupTarget.backupTargetURL,
    }))

    backupSelectedBackingImages(backupImages)
    setIsBackupModalVisible(false)
  }

  const handleBackupCancel = () => {
    setIsBackupModalVisible(false)
  }

  const allActions = [
    {
      key: 'delete',
      name: 'Delete',
      disabled: () => selectedRows.length === 0,
      onClick: handleDelete,
    },
    {
      key: 'download',
      name: 'Download',
      disabled: () => selectedRows.length === 0
        || readyImages.length === 0
        || selectedRows.some((row) => row.dataEngine === 'v2'),
      onClick: handleDownload,
    },
    {
      key: 'backup',
      name: 'Backup',
      disabled: () => selectedRows.length === 0
        || readyImages.length === 0
        || !backupTargetAvailable,
      onClick: handleBackup,
    },
  ]

  return (
    <>
      <div style={{ display: 'flex' }}>
        {allActions.map(({ key, name, disabled, onClick }) => (
          <Button
            key={key}
            size="large"
            type="primary"
            disabled={disabled()}
            onClick={onClick}
            className={styles.bulkActionBtns}
          >
            {name}
          </Button>
        ))}
      </div>
      <Modal
        className={styles.backupModal}
        closable={false}
        width="fit-content"
        okText="Backup"
        visible={isBackupModalVisible}
        onOk={handleBackupOk}
        onCancel={handleBackupCancel}
      >
        <Icon className={styles.questionCircleIcon} type="question-circle" />
        <Form className={styles.backupForm}>
          <p>
            Are you sure you want to backup the following <strong style={readyTextStyle}>Ready</strong> status backing {readyImages.length === 1 ? 'image' : 'images'}?
          </p>
          <ul>{readyImages.map((item) => <li key={item.name}>{item.name}</li>)}</ul>
          <Form.Item label="Backup Target">
            {getFieldDecorator('backupTargetName', {
              initialValue: backupTargets.find((bk) => bk.name === 'default')?.name || '',
            })(
              <Select>
                {backupTargets.map((bkTarget) => (
                  <Select.Option
                    key={bkTarget.name}
                    disabled={!bkTarget.available}
                    value={bkTarget.name}
                  >
                    {bkTarget.name}
                  </Select.Option>
                ))}
              </Select>
            )}
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

BulkActions.propTypes = {
  selectedRows: PropTypes.array.isRequired,
  deleteBackingImages: PropTypes.func.isRequired,
  downloadSelectedBackingImages: PropTypes.func.isRequired,
  backupSelectedBackingImages: PropTypes.func.isRequired,
  backupProps: PropTypes.object.isRequired,
  backupTargets: PropTypes.array.isRequired,
  form: PropTypes.object.isRequired,
}

export default Form.create()(BulkActions)
